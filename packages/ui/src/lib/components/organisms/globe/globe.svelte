<!--
@component Globe
@tags organism, 3d, visualization, interactive, map, globe
@description A 3D interactive globe component using Globe.gl and Three.js
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { mq } from '@layerd/ui';
	import { untrack } from 'svelte';
	import * as THREE from 'three';
	import Globe from 'globe.gl';
	import {
		type GlobeProps,
		type Location,
		createDefaultConfig,
		markerSVG,
		mergeConfigs
	} from '@layerd/ui';

	let {
		locations = $bindable([]),
		class: className = '',
		// All other props are collected into restProps to be merged into the config
		...restProps
	}: GlobeProps = $props();

	// Dynamic import type for Globe
	type GlobeInstance = any;

	// ============================================================================
	// State Management (Svelte 5 Runes)
	// ============================================================================

	let globeContainer: HTMLDivElement | undefined = $state();
	let globeInstance: GlobeInstance | null = $state(null);
	let currentIndex = $state(0);
	let previousLocation: Location | null = $state(null);
	let windowWidth = $state(1920);
	let windowHeight = $state(1080);
	let processedLocations = $state<Location[]>([]);

	// Track media query breakpoints for recreation
	let lastMqSm = $state(mq.sm);
	let lastMqMd = $state(mq.md);
	let lastMqLg = $state(mq.lg);
	let lastMqXl = $state(mq.xl);

	// Store marker elements for class toggling
	let markerElements = $state<Map<string, HTMLElement>>(new Map());

	// Create a reactive, merged configuration
	const mergedConfig = $derived(
		mergeConfigs(
			createDefaultConfig(windowWidth, windowHeight),
			restProps.config, // The main config object prop
			restProps // Individual objects like `data`, `arcs`, etc.
		)
	);

	// Fetch remote data if URIs are provided
	$effect(() => {
		const locs = mergedConfig.data?.locations ?? locations;
		if (typeof locs === 'string') {
			fetch(locs)
				.then((res) => res.json())
				.then((data) => {
					processedLocations = data;
				})
				.catch((err) => console.error('Failed to fetch locations:', err));
		} else {
			processedLocations = locs;
		}
	});

	// Get locations and ports from data config or direct props
	const effectiveLocations = $derived(processedLocations);

	// Current location and ports
	const currentLocation = $derived(effectiveLocations[currentIndex] || null);

	// ============================================================================
	// Helper Functions
	// ============================================================================

	// Attachment function for globe container
	function attachGlobeContainer(element: HTMLElement) {
		globeContainer = element as HTMLDivElement;
		return () => {
			globeContainer = undefined;
		};
	}

	// Create attachment for marker elements
	function createMarkerAttachment(lat: number, lng: number) {
		const key = `${lat},${lng}`;
		return (element: HTMLElement) => {
			markerElements.set(key, element);
			return () => {
				markerElements.delete(key);
			};
		};
	}

	function changeLocation(newIndex: number) {
		const total = effectiveLocations.length;
		if (total === 0) return;
		currentIndex = (newIndex + total) % total;
	}

	function handleKeyboard(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			changeLocation(currentIndex - 1);
			event.preventDefault();
		} else if (event.key === 'ArrowRight') {
			changeLocation(currentIndex + 1);
			event.preventDefault();
		}
	}

	// ============================================================================
	// Effects (Svelte 5 $effect)
	// ============================================================================

	// Update globe rings and view when current location changes
	$effect(() => {
		const globe = globeInstance;
		const location = currentLocation;
		const prevLoc = previousLocation;
		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);

		if (!globe || !location) return;

		// First time initialization
		if (!prevLoc) {
			// Use untrack to avoid triggering effect when setting previousLocation
			untrack(() => {
				previousLocation = location;
			});

			// Update globe view
			globe.pointOfView(
				{
					lat: parseFloat(String(location.lat)) - (cfg.globe?.latitude ?? 0),
					lng: parseFloat(String(location.lng)),
					altitude: cfg.globe?.altitude ?? 0.25
				},
				cfg.animation?.duration ?? 1000
			);

			return;
		}

		// Location change
		// Compare by actual values, not proxy references
		const locationChanged =
			prevLoc.location !== location.location ||
			prevLoc.lat !== location.lat ||
			prevLoc.lng !== location.lng;

		if (locationChanged) {
			// Use untrack to avoid triggering effect when setting previousLocation
			untrack(() => {
				previousLocation = location;
			});

			// Update globe view
			globe.pointOfView(
				{
					lat: parseFloat(String(location.lat)) - (cfg.globe?.latitude ?? 0),
					lng: parseFloat(String(location.lng)),
					altitude: cfg.globe?.altitude ?? 0.25
				},
				cfg.animation?.duration ?? 1000
			);
		}
	});

	// Update markers when current location changes
	$effect(() => {
		const loc = currentLocation;
		if (!loc) return;

		const currentLat = parseFloat(String(loc.lat));
		const currentLng = parseFloat(String(loc.lng));

		setTimeout(() => {
			// Use tracked marker elements instead of querySelectorAll
			markerElements.forEach((markerEl, key) => {
				const marker = markerEl.querySelector('.svg-marker');
				if (!marker) return;

				const [lat, lng] = key.split(',').map(Number);
				const isActive = lat === currentLat && lng === currentLng;

				marker.classList.toggle('active', isActive);
			});
		}, 500);
	});

	// Recreate globe when media query breakpoint changes
	$effect(() => {
		if (!globeInstance) return;

		// Track all media query breakpoints
		const currentMqSm = mq.sm;
		const currentMqMd = mq.md;
		const currentMqLg = mq.lg;
		const currentMqXl = mq.xl;

		// Check if any breakpoint changed
		const breakpointChanged =
			currentMqSm !== lastMqSm ||
			currentMqMd !== lastMqMd ||
			currentMqLg !== lastMqLg ||
			currentMqXl !== lastMqXl;

		if (breakpointChanged) {
			console.log('📱 Media query breakpoint changed, recreating globe...');

			// Save current camera position before destruction
			const currentPov = globeInstance.pointOfView();

			// Destroy current globe instance
			globeInstance._destructor();
			globeInstance = null;

			// Clear marker elements
			markerElements.clear();

			// Update tracking variables
			lastMqSm = currentMqSm;
			lastMqMd = currentMqMd;
			lastMqLg = currentMqLg;
			lastMqXl = currentMqXl;

			// Reset previousLocation so the location-centering effect runs again
			previousLocation = null;

			// Initialization effect will automatically recreate with new props
		}
	});

	// Handle window resize - update globe dimensions
	$effect(() => {
		// Track window dimensions
		windowWidth;
		windowHeight;

		if (!globeInstance) return;

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		globeInstance
			.width(windowWidth)
			.height(windowHeight)
			.globeOffset([cfg.globe?.left ?? 0, cfg.globe?.top ?? 0]);
		// Note: Do NOT update pointOfView here - let the location change effect handle that
	});

	// ============================================================================
	// Globe Initialization (Svelte 5 $effect - HMR-friendly)
	// ============================================================================

	// Initialize globe once when container and locations are ready
	$effect(() => {
		if (!globeContainer || effectiveLocations.length === 0 || globeInstance) return;

		let globe: GlobeInstance | null = null;

		// Initialize Globe.gl (safe to instantiate in browser)
		// Use untrack to prevent re-initialization on config changes
		const cfg = untrack(() => mergedConfig);
		const altitude = cfg.globe?.altitude ?? 0.5;

		try {
			globe = new Globe(globeContainer)
				.backgroundColor('rgba(0,0,0,0)')
				.globeOffset([cfg.globe?.left ?? 0, cfg.globe?.top ?? 0])
				.pointOfView({ lat: 0, lng: 0, altitude })
				.showAtmosphere(cfg.atmosphere?.show ?? true)
				.atmosphereColor(cfg.atmosphere?.color ?? 'lightskyblue')
				.atmosphereAltitude(cfg.atmosphere?.altitude ?? 0.15);

			// Set a single, moderately bright ambient light to make rings/labels visible
			const ambientLight = new THREE.AmbientLight(0xffffff, 2);
			globe.lights([ambientLight]);
			console.log('💡 Set a moderate ambient light for effects.');

			// Disable bloom/glow post-processing effect
			const composer = globe.postProcessingComposer();
			if (composer && composer.passes) {
				const bloomPass = composer.passes.find(
					(pass: any) => pass.name === 'UnrealBloomPass' || pass.name === 'BloomPass'
				);
				if (bloomPass) {
					bloomPass.enabled = false;
					console.log('✅ Disabled bloom pass.');
				}
			}

			// COUNTRY OUTLINES
			if (cfg.data?.polygons) {
				fetch(cfg.data.polygons)
					.then((res) => res.json())
					.then((data) => {
						if (!globe) return;

						const capColor = cfg.polygon?.capColor ?? '#444444';
						const sideColor = cfg.polygon?.sideColor ?? '#444444';
						const strokeColor = cfg.polygon?.strokeColor ?? '#ffffff';

						// Resolve color to string if it's a function
						const resolvedCapColor = typeof capColor === 'function' ? capColor({}) : capColor;
						const resolvedSideColor = typeof sideColor === 'function' ? sideColor({}) : sideColor;
						const resolvedStrokeColor =
							typeof strokeColor === 'function' ? strokeColor : strokeColor;

						globe
							.polygonsData(data.features || data)
							.polygonCapMaterial(
								new THREE.MeshBasicMaterial({
									color: resolvedCapColor,
									transparent: false,
									side: THREE.DoubleSide
								})
							)
							.polygonSideMaterial(
								new THREE.MeshBasicMaterial({
									color: resolvedSideColor,
									transparent: false,
									side: THREE.DoubleSide
								})
							)
							.polygonStrokeColor(() => resolvedStrokeColor)
							.polygonAltitude(cfg.polygon?.altitude ?? 0.005)
							.polygonsTransitionDuration(cfg.polygon?.transitionDuration ?? 0);
					})
					.catch((err) => console.error('Failed to load polygon data:', err));
			}

			globe
				// POINTS - Solid blue dots (base layer)
				.pointsData(effectiveLocations)
				.pointAltitude(() => cfg.points?.altitude ?? 0.003)
				.pointColor(() => cfg.points?.color ?? '#0066ff')
				.pointRadius(0.25)
				// HTML - Location markers with click handlers
				.htmlElementsData(effectiveLocations)
				.htmlElement((d: any) => {
					const el = document.createElement('div');
					el.innerHTML = markerSVG;
					el.dataset.lat = String(d.lat);
					el.dataset.lng = String(d.lng);

					// Apply attachment for lifecycle tracking
					const markerKey = createMarkerAttachment(
						parseFloat(String(d.lat)),
						parseFloat(String(d.lng))
					);
					markerKey(el);

					el.style.pointerEvents = 'auto';
					el.style.cursor = 'pointer';
					el.onclick = () => {
						const idx = effectiveLocations.findIndex(
							(loc) =>
								parseFloat(String(loc.lat)) === parseFloat(String(d.lat)) &&
								parseFloat(String(loc.lng)) === parseFloat(String(d.lng))
						);
						if (idx >= 0) {
							changeLocation(idx);
						}
					};
					return el;
				})
				.htmlLat((d: any) => d.lat)
				.htmlLng((d: any) => d.lng)
				.htmlAltitude(cfg.html?.altitude ?? 0.02);

			// Set globeInstance BEFORE onGlobeReady so location-centering effect can access it
			globe.controls().enableZoom = false;
			globeInstance = globe;

			// FIRST LOAD - Triggered after globe is fully initialized
			globe.onGlobeReady(() => {
				if (!globe) return;

				const scene = globe!.scene();

				// Make ONLY the globe sphere a solid, unlit black
				scene.traverse((object: any) => {
					if (object.type === 'Mesh' && object.geometry?.type === 'SphereGeometry') {
						object.material = new THREE.MeshBasicMaterial({
							color: 0x000000 // Solid black
						});
						console.log('✅ Converted globe sphere to solid black MeshBasicMaterial.');
					}
				});

				// Set currentIndex to trigger location-centering effect
				if (effectiveLocations.length > 0) {
					currentIndex = 0;
				}
			});
		} catch (error) {
			console.error('Failed to initialize Globe.gl:', error);
			// Display user-friendly error message
			if (globeContainer) {
				globeContainer.innerHTML = `
					<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; padding: 20px;">
						<div>
							<h3 style="margin-bottom: 10px;">Unable to load 3D Globe</h3>
							<p style="opacity: 0.7; font-size: 14px;">WebGL context error. Please try:</p>
							<ul style="list-style: none; padding: 0; opacity: 0.7; font-size: 14px;">
								<li>• Refresh the page (Ctrl+Shift+R)</li>
								<li>• Close other browser tabs</li>
								<li>• Restart your browser</li>
							</ul>
						</div>
					</div>
				`;
			}
		}
	});

	// Keyboard navigation and cleanup
	onMount(() => {
		window.addEventListener('keydown', handleKeyboard);

		return () => {
			window.removeEventListener('keydown', handleKeyboard);
			// Cleanup globe on component unmount
			if (globeInstance) {
				globeInstance._destructor();
				globeInstance = null;
			}
		};
	});
</script>

<svelte:window
	bind:innerWidth={windowWidth}
	bind:innerHeight={windowHeight}
/>

<div
	class="globe-container w-svh relative h-svh {className}"
	{@attach attachGlobeContainer}
></div>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	:global(.svg-marker) {
		width: 40px;
		height: 40px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	:global(.svg-marker.active .stroke) {
		stroke: white;
		transition: stroke 0.3s ease;
	}

	:global(.svg-marker .bg) {
		fill: white;
		transition: fill 0.3s ease;
	}

	:global(.svg-marker .fg) {
		fill: var(--color-primary-600);
		transition: fill 0.3s ease;
	}

	/* SVG Marker (active) */
	:global(.svg-marker.active) {
		@apply md:scale-200 inline-block -translate-y-4 scale-150 md:translate-y-0;
		animation: float 6s ease-in-out infinite;
	}

	:global(.svg-marker.active .stroke) {
		stroke: white;
	}

	:global(.svg-marker.active .bg) {
		fill: white;
	}

	:global(.svg-marker:not(.active):hover) {
		transform: scale(1.1);
	}

	/* ---------------------------------------- */
	/* ANIMATIONS                          */
	/* ---------------------------------------- */
	@keyframes float {
		0% {
			transform: translatey(0px);
		}
		50% {
			transform: translatey(-2px);
		}
		100% {
			transform: translatey(0px);
		}
	}

	@keyframes blink {
		0% {
			fill: var(--color-primary);
		}
		50% {
			fill: var(--color-primary);
			opacity: 0.75;
		}
		100% {
			fill: var(--color-primary);
		}
	}
</style>
