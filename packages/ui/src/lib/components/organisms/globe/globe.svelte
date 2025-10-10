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

	// ============================================================================
	// Location Navigation Functions
	// ============================================================================

	/**
	 * Change the active location by index
	 * Handles wrapping for out-of-bounds indices
	 */
	function changeLocation(newIndex: number) {
		const total = effectiveLocations.length;
		if (total === 0) return;
		currentIndex = (newIndex + total) % total;
	}

	/**
	 * Set the active location by index (alias for changeLocation)
	 */
	function setActiveLocation(index: number) {
		changeLocation(index);
	}

	/**
	 * Move to the next location
	 */
	function nextLocation() {
		changeLocation(currentIndex + 1);
	}

	/**
	 * Move to the previous location
	 */
	function prevLocation() {
		changeLocation(currentIndex - 1);
	}

	/**
	 * Find and activate a location by matching the location object
	 */
	function goToLocation(location: Location) {
		const idx = effectiveLocations.findIndex(
			(loc) =>
				parseFloat(String(loc.lat)) === parseFloat(String(location.lat)) &&
				parseFloat(String(loc.lng)) === parseFloat(String(location.lng))
		);
		if (idx >= 0) {
			changeLocation(idx);
		}
	}

	/**
	 * Animate arc between two locations
	 * Called when location changes to show travel animation
	 */
	function animateArcTransition(fromLocation: Location, toLocation: Location) {
		if (!globeInstance) return;

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const arcsConfig = cfg.arcs;

		if (!arcsConfig) return;

		// Create arc data from previous to current location
		const arcData = [
			{
				startLat: parseFloat(String(fromLocation.lat)),
				startLng: parseFloat(String(fromLocation.lng)),
				endLat: parseFloat(String(toLocation.lat)),
				endLng: parseFloat(String(toLocation.lng))
			}
		];

		// Get dash configuration
		const dashLength = arcsConfig.dashLength ?? 0.6;
		const dashGap = arcsConfig.dashGap ?? 2;
		const dashInitialGap = arcsConfig.dashInitialGap ?? 1;
		const duration = arcsConfig.duration ?? 2000;

		// Calculate total dash cycle length (dash + gap)
		// The animation time is for one full arc length, but we need to wait for the entire
		// dash+gap pattern to complete its journey
		const totalDashCycle = dashLength + dashGap;

		// The time it takes for the full dash pattern (including gap) to traverse the arc
		// We need to account for the initial gap as well
		const fullAnimationTime = duration * (1 + dashGap / totalDashCycle);

		// Configure arc visualization
		globeInstance
			.arcsData(arcData)
			.arcColor(() => arcsConfig.color ?? '#ffffff')
			.arcStroke(() => arcsConfig.stroke ?? 0.5)
			.arcDashLength(dashLength)
			.arcDashGap(dashGap)
			.arcDashInitialGap(dashInitialGap)
			.arcDashAnimateTime(duration)
			.arcAltitude(arcsConfig.altitude !== undefined ? arcsConfig.altitude : null)
			.arcAltitudeAutoScale(arcsConfig.altitudeAutoscale ?? 0.5)
			.arcStartAltitude(() => arcsConfig.startAltitude ?? 0.003)
			.arcEndAltitude(() => arcsConfig.endAltitude ?? 0.003);

		// Clear arcs after the full animation completes (dash + gap)
		setTimeout(() => {
			if (globeInstance) {
				globeInstance.arcsData([]);
			}
		}, fullAnimationTime);
	}

	/**
	 * Auto-play state and control
	 */
	let autoPlayInterval: ReturnType<typeof setInterval> | null = $state(null);
	let isAutoPlaying = $state(false);
	let resumeTimeout: ReturnType<typeof setTimeout> | null = $state(null);

	/**
	 * Start auto-playing through locations
	 * @param intervalMs - Time in milliseconds between location changes (default: 3000ms)
	 */
	function startAutoPlay(intervalMs: number = 3000) {
		if (isAutoPlaying) return; // Already playing

		isAutoPlaying = true;
		autoPlayInterval = setInterval(() => {
			nextLocation();
		}, intervalMs);
	}

	/**
	 * Stop auto-playing
	 */
	function stopAutoPlay() {
		if (autoPlayInterval) {
			clearInterval(autoPlayInterval);
			autoPlayInterval = null;
		}
		if (resumeTimeout) {
			clearTimeout(resumeTimeout);
			resumeTimeout = null;
		}
		isAutoPlaying = false;
	}

	/**
	 * Pause auto-play temporarily (for pauseOnInteraction)
	 */
	function pauseAutoPlay() {
		if (autoPlayInterval) {
			clearInterval(autoPlayInterval);
			autoPlayInterval = null;
		}
		isAutoPlaying = false;
	}

	/**
	 * Schedule resuming auto-play after a delay
	 */
	function scheduleResumeAutoPlay(intervalMs: number, resumeDelayMs: number) {
		if (resumeTimeout) {
			clearTimeout(resumeTimeout);
		}
		resumeTimeout = setTimeout(() => {
			startAutoPlay(intervalMs);
		}, resumeDelayMs);
	}

	/**
	 * Toggle auto-play on/off
	 */
	function toggleAutoPlay(intervalMs: number = 3000) {
		if (isAutoPlaying) {
			stopAutoPlay();
		} else {
			startAutoPlay(intervalMs);
		}
	}

	// Initialize autoplay based on config
	$effect(() => {
		// Only depend on config, not on isAutoPlaying state
		const autoplayConfig = mergedConfig.autoplay;
		const hasLocations = effectiveLocations.length > 0;

		if (autoplayConfig?.enabled && hasLocations) {
			const interval = autoplayConfig.interval ?? 3000;
			// Use untrack to prevent reading isAutoPlaying from creating a dependency
			if (!untrack(() => isAutoPlaying)) {
				untrack(() => startAutoPlay(interval));
			}
		} else {
			// Stop if disabled or no locations
			untrack(() => stopAutoPlay());
		}

		return () => {
			// Cleanup on effect re-run or unmount
			untrack(() => stopAutoPlay());
		};
	});

	// ============================================================================
	// Keyboard Navigation
	// ============================================================================

	function handleKeyboard(event: KeyboardEvent) {
		// Use untrack to read config without creating dependencies
		const autoplayConfig = untrack(() => mergedConfig.autoplay);

		if (event.key === 'ArrowLeft') {
			prevLocation();
			event.preventDefault();

			// Handle pause on interaction
			if (autoplayConfig?.pauseOnInteraction && untrack(() => isAutoPlaying)) {
				pauseAutoPlay();
				if (autoplayConfig.resumeDelay) {
					scheduleResumeAutoPlay(autoplayConfig.interval ?? 3000, autoplayConfig.resumeDelay);
				}
			}
		} else if (event.key === 'ArrowRight') {
			nextLocation();
			event.preventDefault();

			// Handle pause on interaction
			if (autoplayConfig?.pauseOnInteraction && untrack(() => isAutoPlaying)) {
				pauseAutoPlay();
				if (autoplayConfig.resumeDelay) {
					scheduleResumeAutoPlay(autoplayConfig.interval ?? 3000, autoplayConfig.resumeDelay);
				}
			}
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

			// Animate arc from previous to current location
			animateArcTransition(prevLoc, location);

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
							setActiveLocation(idx);

							// Handle pause on interaction
							const autoplayConfig = mergedConfig.autoplay;
							if (autoplayConfig?.pauseOnInteraction && isAutoPlaying) {
								pauseAutoPlay();
								if (autoplayConfig.resumeDelay) {
									scheduleResumeAutoPlay(
										autoplayConfig.interval ?? 3000,
										autoplayConfig.resumeDelay
									);
								}
							}
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

			// Stop auto-play
			stopAutoPlay();

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
