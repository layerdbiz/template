<!--
@component Globe
@tags organism, 3d, visualization, interactive, map
-->

<script lang="ts">
	import { browser } from '$app/environment';
	import { mq } from '@layerd/ui';
	import { untrack } from 'svelte';
	import * as THREE from 'three';
	import {
		type GlobeProps,
		type Location,
		type Port,
		type Arc,
		type Ring,
		type Label,
		createDefaultConfig,
		avoidLabelCollisions,
		createAutoPlay,
		markerSVG,
		mergeConfigs
	} from '@layerd/ui';

	let {
		locations = $bindable([]),
		ports = $bindable([]),
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
	let activeArcs: Arc[] = $state([]);
	let activeRings: Ring[] = $state([]);
	let windowDimensions = $state({
		width: browser ? window.innerWidth : 1920,
		height: browser ? window.innerHeight : 1080
	});

	// Create a reactive, merged configuration
	const mergedConfig = $derived(
		mergeConfigs(
			createDefaultConfig(windowDimensions.width, windowDimensions.height),
			restProps.config, // The main config object prop
			restProps // Individual objects like `data`, `arcs`, etc.
		)
	);

	// Get locations and ports from data config or direct props
	const effectiveLocations = $derived(mergedConfig.data?.locations ?? locations);
	const effectivePorts = $derived(mergedConfig.data?.ports ?? ports);

	// Current location and ports
	const currentLocation = $derived(effectiveLocations[currentIndex] || null);
	const currentPorts = $derived(
		currentLocation
			? effectivePorts.filter((port) => port.location === currentLocation.location)
			: []
	);

	// ============================================================================
	// Helper Functions
	// ============================================================================

	function changeLocation(newIndex: number) {
		const total = effectiveLocations.length;
		if (total === 0) return;
		currentIndex = (newIndex + total) % total;
	}

	function emitArc(startLocation: Location, endLocation: Location) {
		if (!startLocation || !endLocation || !globeInstance) return;

		const startLat = parseFloat(String(startLocation.lat));
		const startLng = parseFloat(String(startLocation.lng));
		const endLat = parseFloat(String(endLocation.lat));
		const endLng = parseFloat(String(endLocation.lng));

		const globe = globeInstance;
		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const FLIGHT_TIME = cfg.arcs?.flightTime ?? 2000;
		const ARC_REL_LEN = cfg.arcs?.relativeLength ?? 0.4;

		// Create and add the arc
		const arc: Arc = {
			startLat,
			startLng,
			endLat,
			endLng,
			color: cfg.arcs?.color ?? 'rgba(255, 255, 255, 1)'
		};
		// Use untrack to read current state without dependency
		const currentArcs = untrack(() => activeArcs);
		const newArcs = [...currentArcs, arc];
		activeArcs = newArcs;
		globe.arcsData(newArcs);

		// Remove arc after animation completes
		setTimeout(() => {
			activeArcs = activeArcs.filter((d) => d !== arc);
			globe.arcsData(activeArcs);
		}, FLIGHT_TIME * 2);

		// Add start location rings
		const startRing: Ring = { lat: startLat, lng: startLng };
		// Use untrack to read current state without dependency
		const currentRings = untrack(() => activeRings);
		const newStartRings = [...currentRings, startRing];
		activeRings = newStartRings;
		globe.ringsData(newStartRings);

		// Remove start rings after partial animation
		setTimeout(() => {
			activeRings = activeRings.filter((r) => r !== startRing);
			globe.ringsData(activeRings);
		}, FLIGHT_TIME * ARC_REL_LEN);

		// Add end location rings with delay
		setTimeout(() => {
			const endRing: Ring = { lat: endLat, lng: endLng };
			const currentRings2 = untrack(() => activeRings);
			const newEndRings = [...currentRings2, endRing];
			activeRings = newEndRings;
			globe.ringsData(newEndRings);

			// Remove end rings after partial animation
			setTimeout(() => {
				activeRings = activeRings.filter((r) => r !== endRing);
				globe.ringsData(activeRings);
			}, FLIGHT_TIME * ARC_REL_LEN);
		}, FLIGHT_TIME);

		// After all animations, set current location to active
		setTimeout(
			() => {
				globe.ringsData([{ lat: endLat, lng: endLng }]);
			},
			FLIGHT_TIME * (1 + ARC_REL_LEN)
		);
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

		// Clear any existing rings immediately
		globe.ringsData([]);

		// First time initialization - single ring animation
		if (!prevLoc) {
			const ring: Ring = {
				lat: parseFloat(String(location.lat)),
				lng: parseFloat(String(location.lng))
			};
			setTimeout(() => {
				globe.ringsData([ring]);

				// Remove ring after animation
				setTimeout(
					() => {
						globe.ringsData([]);
					},
					(cfg.arcs?.flightTime ?? 2000) * (cfg.arcs?.relativeLength ?? 0.4)
				);
			}, 100);

			// Use untrack to avoid triggering effect when setting previousLocation
			untrack(() => {
				previousLocation = location;
			});

			// Update globe view
			globe.pointOfView(
				{
					lat: parseFloat(String(location.lat)) - (cfg.position?.latitude ?? 0),
					lng: parseFloat(String(location.lng)),
					altitude: cfg.position?.altitude ?? 0.25
				},
				cfg.animation?.duration ?? 1000
			);

			return;
		}

		// Location change - emit arc and ring animations
		// Compare by actual values, not proxy references
		const locationChanged =
			prevLoc.location !== location.location ||
			prevLoc.lat !== location.lat ||
			prevLoc.lng !== location.lng;

		if (locationChanged) {
			emitArc(prevLoc, location);

			// Use untrack to avoid triggering effect when setting previousLocation
			untrack(() => {
				previousLocation = location;
			});

			// Update globe view
			globe.pointOfView(
				{
					lat: parseFloat(String(location.lat)) - (cfg.position?.latitude ?? 0),
					lng: parseFloat(String(location.lng)),
					altitude: cfg.position?.altitude ?? 0.25
				},
				cfg.animation?.duration ?? 1000
			);
		}
	});

	// Update labels when current ports change
	$effect(() => {
		const globe = globeInstance;
		const ports = currentPorts;
		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);

		if (!globe || !ports.length) {
			if (globe) globe.labelsData([]);
			return;
		}

		// Clear existing labels immediately
		globe.labelsData([]);

		// Add delay to match arc animation timing
		setTimeout(
			() => {
				// Create initial label data
				const labelData: Label[] = ports.map((port) => ({
					lat: parseFloat(String(port.lat)),
					lng: parseFloat(String(port.lng)),
					label: port.city || 'Unknown Port',
					size: cfg.labels?.size ?? 0.5,
					dotRadius: cfg.labels?.dotRadius ?? 0.2,
					orientation: 'bottom'
				}));

				// Apply collision detection
				const adjustedLabels = avoidLabelCollisions(labelData);
				globe.labelsData(adjustedLabels);
			},
			(cfg.arcs?.flightTime ?? 2000) + 500
		);
	});

	// Update markers when current location changes
	$effect(() => {
		if (!browser) return;

		const loc = currentLocation;
		if (!loc) return;

		setTimeout(() => {
			document.querySelectorAll('.svg-marker').forEach((marker) => {
				const parent = marker.closest('[data-lat][data-lng]') as HTMLElement | null;
				if (!parent) return;

				const lat = parent.dataset.lat;
				const lng = parent.dataset.lng;

				const isActive =
					parseFloat(lat || '0') === parseFloat(String(loc.lat)) &&
					parseFloat(lng || '0') === parseFloat(String(loc.lng));

				marker.classList.toggle('active', isActive);
			});
		}, 500);
	});

	// ============================================================================
	// Globe Initialization (Svelte 5 $effect - HMR-friendly)
	// ============================================================================

	// Initialize globe when container is ready
	$effect(() => {
		if (!browser || !globeContainer || effectiveLocations.length === 0) return;

		let globe: GlobeInstance | null = null;
		let isDestroyed = false;

		// Dynamically import and initialize Globe.gl only in browser
		(async () => {
			try {
				const GlobeGL = await import('globe.gl');
				const Globe = GlobeGL.default;

				// Check if component was destroyed during async import
				if (isDestroyed) return;

				const cfg = untrack(() => mergedConfig);
				const altitude = cfg.position?.altitude ?? 0.5;

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
							if (isDestroyed || !globe) return;
							globe
								.polygonsData(data.features || data)
								.polygonCapMaterial(
									new THREE.MeshBasicMaterial({
										color: '#323035',
										transparent: true
									})
								)
								.polygonSideMaterial(
									new THREE.MeshBasicMaterial({
										color: '#323035',
										transparent: true
									})
								)
								.polygonStrokeColor(() => cfg.polygon?.strokeColor ?? 'rgba(255, 255, 255, 1)')
								.polygonAltitude(cfg.polygon?.altitude ?? 0.005)
								.polygonsTransitionDuration(cfg.polygon?.transitionDuration ?? 0);
						})
						.catch((err) => console.error('Failed to load polygon data:', err));
				}

				globe
					// RINGS - Above countries (0.002)
					.ringLat((d: any) => d.lat)
					.ringLng((d: any) => d.lng)
					.ringAltitude(cfg.rings?.altitude ?? 0.002)
					.ringColor(() => (t: number) => `rgba(255,255,255,${1 - t})`)
					.ringMaxRadius(cfg.rings?.maxRadius ?? 4)
					.ringPropagationSpeed(cfg.rings?.propagationSpeed ?? 4)
					.ringResolution(64)
					.ringsData([])
					.ringRepeatPeriod(
						((cfg.arcs?.flightTime ?? 2000) * (cfg.arcs?.relativeLength ?? 0.4)) /
							(cfg.arcs?.numRings ?? 5)
					)
					// ARCS - Above rings
					.arcColor('color')
					.arcStroke(cfg.arcs?.stroke ?? 0.2)
					.arcDashLength(cfg.arcs?.dashLength ?? 0.6)
					.arcDashGap(cfg.arcs?.dashGap ?? 2)
					.arcDashInitialGap(cfg.arcs?.dashInitialGap ?? 1)
					.arcDashAnimateTime(cfg.arcs?.flightTime ?? 2000)
					.arcAltitude(cfg.arcs?.altitude ?? null)
					.arcAltitudeAutoScale(cfg.arcs?.altitudeAutoscale ?? 0.3)
					.arcsTransitionDuration(0)
					.arcLabel((d: any) => `${d.port || 'Port'} - ${d.city || 'Unknown'}`)
					// POINTS - Above rings (0.003) - Solid blue dots (base layer)
					.pointsData(effectiveLocations)
					.pointAltitude(() => cfg.points?.altitude ?? 0.003)
					.pointColor(() => cfg.points?.color ?? '#0066ff')
					.pointRadius(0.25)
					// LABELS - Directly on top of blue points (0.004)
					.labelColor(() => cfg.labels?.textColor ?? 'rgba(255, 255, 255, 1)')
					.labelDotOrientation((d: any) => d.orientation)
					.labelDotRadius(() => cfg.labels?.dotRadius ?? 0.25)
					.labelSize(() => cfg.labels?.size ?? 1)
					.labelText('label')
					.labelLabel((d: any) => `<div>${d.label}</div>`)
					.labelAltitude(0.001)
					.labelResolution(120)
					// HTML - Floating above everything (0.006)
					.htmlElementsData(effectiveLocations)
					.htmlElement((d: any) => {
						const el = document.createElement('div');
						el.innerHTML = markerSVG;
						el.dataset.lat = String(d.lat);
						el.dataset.lng = String(d.lng);

						el.style.pointerEvents = 'auto';
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
					.htmlAltitude(0.01)
					// FIRST LOAD
					.onGlobeReady(() => {
						if (isDestroyed) return;

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

						if (effectiveLocations.length > 0) {
							const firstLocation = effectiveLocations[0];
							globe!.ringsData([
								{
									lat: parseFloat(String(firstLocation.lat)),
									lng: parseFloat(String(firstLocation.lng))
								}
							]);
							currentIndex = 0;

							// Setup auto-play
							if (cfg.autoplay?.enabled && globeContainer) {
								const interactionElements = [globeContainer, document];
								createAutoPlay(
									cfg.autoplay,
									() => changeLocation(currentIndex + 1),
									interactionElements
								)(true);
							}
						}
					});

				globe.controls().enableZoom = false;
				globeInstance = globe;
			} catch (error) {
				console.error('Failed to initialize Globe.gl:', error);
				// Display user-friendly error message
				if (globeContainer && !isDestroyed) {
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
		})();

		// Cleanup function that runs when effect re-runs or component unmounts
		return () => {
			isDestroyed = true;
			if (globe) {
				globe._destructor();
			}
			globeInstance = null;
		};
	});

	// Window resize handler
	$effect(() => {
		if (!browser) return;

		const handleResize = () => {
			windowDimensions = {
				width: window.innerWidth,
				height: window.innerHeight
			};

			if (globeInstance) {
				// Use untrack to read config without creating dependency
				const cfg = untrack(() => mergedConfig);
				globeInstance
					.width(window.innerWidth)
					.height(window.innerHeight)
					.globeOffset([cfg.globe?.left ?? 0, cfg.globe?.top ?? 0])
					.pointOfView({ lat: 0, lng: 0, altitude: cfg.position?.altitude ?? 0.5 }, 1000);
			}
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	// Keyboard navigation
	$effect(() => {
		if (!browser) return;

		window.addEventListener('keydown', handleKeyboard);
		return () => window.removeEventListener('keydown', handleKeyboard);
	});
</script>

<div
	bind:this={globeContainer}
	class="globe-container {className}"
></div>

<style>
	.globe-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	:global(.svg-marker) {
		width: 40px;
		height: 40px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	:global(.svg-marker .stroke) {
		stroke: white;
		transition: stroke 0.3s ease;
	}

	:global(.svg-marker .bg) {
		fill: white;
		transition: fill 0.3s ease;
	}

	:global(.svg-marker .fg) {
		fill: #333;
		transition: fill 0.3s ease;
	}

	:global(.svg-marker.active) {
		transform: scale(1.2);
	}

	:global(.svg-marker.active .stroke) {
		stroke: lime;
	}

	:global(.svg-marker.active .bg) {
		fill: lime;
	}

	:global(.svg-marker:hover) {
		transform: scale(1.1);
	}
</style>
