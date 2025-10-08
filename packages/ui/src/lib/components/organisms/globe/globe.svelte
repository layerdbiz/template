<!--
@component Globe
@tags organism, 3d, visualization, interactive, map

A 3D interactive globe visualization component using globe.gl.
Displays locations with markers, arcs, rings, and labels.

@example
```svelte
<script>
	import { Globe } from '@layerd/ui';

	const locations = [
		{ location: 'New York', lat: 40.7128, lng: -74.0060, phone: '555-0001', email: 'ny@example.com' }
	];

	const ports = [
		{ port: 'Brooklyn Port', city: 'Brooklyn', location: 'New York', lat: 40.6526, lng: -74.0102 }
	];
</script>

<Globe {locations} {ports} />
```
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
		markerSVG
	} from './globe.svelte.ts';

	let {
		locations = $bindable([]),
		ports = $bindable([]),
		config: userConfig = {},
		class: className = '',
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

	// Derived config with responsive values (pass mq.sm to avoid reactive loop)
	const config = $derived(
		createDefaultConfig(windowDimensions.width, windowDimensions.height, mq.sm)
	);
	const mergedConfig = $derived({ ...config, ...userConfig });

	// Current location and ports
	const currentLocation = $derived(locations[currentIndex] || null);
	const currentPorts = $derived(
		currentLocation ? ports.filter((port) => port.location === currentLocation.location) : []
	);

	// ============================================================================
	// Helper Functions
	// ============================================================================

	function changeLocation(newIndex: number) {
		const total = locations.length;
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
		const FLIGHT_TIME = cfg.arcFlightTime || 2000;
		const ARC_REL_LEN = cfg.arcRelativeLength || 0.4;

		// Create and add the arc
		const arc: Arc = {
			startLat,
			startLng,
			endLat,
			endLng,
			color: cfg.arcColor || 'rgba(255, 255, 255, 1)'
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
					(cfg.arcFlightTime || 2000) * (cfg.arcRelativeLength || 0.4)
				);
			}, 100);

			// Use untrack to avoid triggering effect when setting previousLocation
			untrack(() => {
				previousLocation = location;
			});

			// Update globe view
			globe.pointOfView(
				{
					lat: parseFloat(String(location.lat)) - (cfg.povLatitude || 0),
					lng: parseFloat(String(location.lng)),
					altitude: cfg.povAltitude || 0.5
				},
				cfg.animationDuration || 1000
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
					lat: parseFloat(String(location.lat)) - (cfg.povLatitude || 0),
					lng: parseFloat(String(location.lng)),
					altitude: cfg.povAltitude || 0.5
				},
				cfg.animationDuration || 1000
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
					size: cfg.labelSize || 0.5,
					dotRadius: cfg.labelDotRadius || 0.2,
					orientation: 'bottom'
				}));

				// Apply collision detection
				const adjustedLabels = avoidLabelCollisions(labelData);
				globe.labelsData(adjustedLabels);
			},
			(cfg.arcFlightTime || 2000) + 500
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
	// Globe Initialization (Attachment Factory for {@attach})
	// ============================================================================

	/**
	 * Creates an attachment for initializing the Globe.gl instance
	 * @returns {import('svelte/attachments').Attachment}
	 */
	function createGlobeAttachment() {
		return (container: HTMLDivElement) => {
			if (!browser || !container || locations.length === 0) return;

			let globe: GlobeInstance | null = null;

			// Dynamically import and initialize Globe.gl only in browser
			(async () => {
				const GlobeGL = await import('globe.gl');
				const Globe = GlobeGL.default;

				const cfg = mergedConfig;
				const altitude = cfg.povAltitude || 0.5;

				globe = new Globe(container)
					// GLOBE
					.globeImageUrl(cfg.imgEarth || '/images/skins/earth-blue-marble.jpg')
					.backgroundColor('rgba(0,0,0,0)')
					.globeOffset([cfg.globeLeft || 0, cfg.globeTop || 0])
					.pointOfView({ lat: 0, lng: 0, altitude })
					// ATMOSPHERE
					.showAtmosphere(true)
					.atmosphereColor('#00bcff')
					.atmosphereAltitude(mq.sm ? 0.1 : 0.2)
					// RINGS
					.ringLat((d: any) => d.lat)
					.ringLng((d: any) => d.lng)
					.ringAltitude(cfg.ringAltitude || 0)
					.ringColor(() => (t: number) => `rgba(255,255,255,${1 - t})`)
					.ringMaxRadius(cfg.ringMaxRadius || 4)
					.ringPropagationSpeed(cfg.ringPropagationSpeed || 4)
					.ringResolution(64)
					.ringsData([])
					.ringRepeatPeriod(
						((cfg.arcFlightTime || 2000) * (cfg.arcRelativeLength || 0.4)) / (cfg.arcNumRings || 5)
					)
					// ARCS
					.arcColor('color')
					.arcStroke(cfg.arcStroke || 0.2)
					.arcDashLength(cfg.arcDashLength || 0.6)
					.arcDashGap(cfg.arcDashGap || 2)
					.arcDashInitialGap(cfg.arcDashInitialGap || 1)
					.arcDashAnimateTime(cfg.arcFlightTime || 2000)
					.arcAltitude(cfg.arcAltitude ?? null)
					.arcAltitudeAutoScale(cfg.arcAltitudeAutoscale || 0.3)
					.arcsTransitionDuration(0)
					.arcLabel((d: any) => `${d.port || 'Port'} - ${d.city || 'Unknown'}`)
					// POINTS
					.pointsData(locations)
					.pointAltitude(() => cfg.pointAltitude || 0.001)
					.pointColor(() => cfg.pointColor || 'rgba(0, 0, 255, 1)')
					// HTML
					.htmlElementsData(locations)
					.htmlElement((d: any) => {
						const el = document.createElement('div');
						el.innerHTML = markerSVG;
						el.dataset.lat = String(d.lat);
						el.dataset.lng = String(d.lng);

						el.style.pointerEvents = 'auto';
						el.onclick = () => {
							const idx = locations.findIndex(
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
					.htmlAltitude(0.005)
					// LABELS
					.labelColor(() => cfg.labelTextColor || 'rgba(255, 255, 255, 1)')
					.labelDotOrientation((d: any) => d.orientation)
					.labelDotRadius(() => cfg.labelDotRadius || 0.2)
					.labelSize(() => cfg.labelSize || 0.5)
					.labelText('label')
					.labelLabel((d: any) => `<div>${d.label}</div>`)
					.labelAltitude(0.0011)
					.labelResolution(20)
					// FIRST LOAD
					.onGlobeReady(() => {
						if (locations.length > 0) {
							const firstLocation = locations[0];
							globe!.ringsData([
								{
									lat: parseFloat(String(firstLocation.lat)),
									lng: parseFloat(String(firstLocation.lng))
								}
							]);
							currentIndex = 0;

							// Setup auto-play
							if (cfg.autoPlay && container) {
								const interactionElements = [container, document];
								createAutoPlay(
									cfg,
									() => changeLocation(currentIndex + 1),
									interactionElements
								)(true);
							}
						}

						// Apply vignette/gradient shadow to the globe using custom shader
						if (cfg.vignetteEnabled) {
							const scene = globe!.scene();

							// Find the globe mesh in the scene
							let globeMesh: THREE.Mesh<THREE.SphereGeometry> | undefined;
							scene.traverse((object: THREE.Object3D) => {
								if (
									!globeMesh &&
									object instanceof THREE.Mesh &&
									object.geometry instanceof THREE.SphereGeometry
								) {
									globeMesh = object;
								}
							});

							if (globeMesh) {
								const mesh = globeMesh;
								const material = mesh.material;

								// Only apply shader if it's a MeshPhongMaterial (globe.gl default)
								if (material instanceof THREE.MeshPhongMaterial) {
									// Create custom shader with improved gradient
									const vignetteShaderMaterial = new THREE.ShaderMaterial({
										uniforms: {
											...THREE.UniformsUtils.clone(THREE.ShaderLib.phong.uniforms),
											map: { value: material.map },
											bumpMap: { value: material.bumpMap || null },
											bumpScale: { value: material.bumpScale || 1 },
											fadeStart: { value: cfg.vignetteFadeStart || 0.3 },
											fadeEnd: { value: cfg.vignetteFadeEnd || 1.0 },
											vignetteOpacity: { value: cfg.vignetteOpacity || 0.7 }
										},
										vertexShader: `
											#include <common>
											#include <uv_pars_vertex>
											#include <displacementmap_pars_vertex>
											#include <fog_pars_vertex>
											#include <lights_pars_begin>
											#include <logdepthbuf_pars_vertex>
											
											varying vec3 vPosition;
											varying vec3 vNormal;
											varying vec3 vViewPosition;
											
											void main() {
												#include <uv_vertex>
												#include <beginnormal_vertex>
												#include <defaultnormal_vertex>
												#include <begin_vertex>
												
												vPosition = position;
												vNormal = normalize(normalMatrix * normal);
												
												vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
												vViewPosition = -mvPosition.xyz;
												gl_Position = projectionMatrix * mvPosition;
												
												#include <logdepthbuf_vertex>
												#include <fog_vertex>
											}
										`,
										fragmentShader: `
											uniform sampler2D map;
											uniform sampler2D bumpMap;
											uniform float bumpScale;
											uniform float fadeStart;
											uniform float fadeEnd;
											uniform float vignetteOpacity;
											
											varying vec3 vPosition;
											varying vec3 vNormal;
											varying vec3 vViewPosition;
											varying vec2 vUv;
											
											#include <common>
											#include <lights_pars_begin>
											#include <fog_pars_fragment>
											
											void main() {
												// Sample the original globe texture
												vec4 texColor = texture2D(map, vUv);
												
												// Calculate lighting (Phong illumination)
												vec3 normal = normalize(vNormal);
												vec3 viewDir = normalize(vViewPosition);
												
												// Ambient light
												vec3 ambient = vec3(0.3);
												
												// Directional light
												vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
												float diff = max(dot(normal, lightDir), 0.0);
												vec3 diffuse = diff * vec3(1.0);
												
												// Apply lighting to texture
												vec3 lighting = ambient + diffuse;
												vec3 litColor = texColor.rgb * lighting;
												
												// Calculate vertical gradient (bottom to top)
												// Normalize Y position: -1 to 1 becomes 0 to 1
												float normalizedY = (vPosition.y + 1.0) / 2.0;
												
												// Smooth gradient from fadeStart to fadeEnd
												float gradient = smoothstep(fadeStart, fadeEnd, normalizedY);
												
												// Invert gradient: 1 at bottom (dark), 0 at top (light)
												float vignetteAlpha = (1.0 - gradient) * vignetteOpacity;
												
												// Blend: darken bottom, preserve top
												vec3 finalColor = mix(vec3(0.0), litColor, 1.0 - vignetteAlpha);
												
												gl_FragColor = vec4(finalColor, 1.0);
												
												#include <fog_fragment>
											}
										`,
										lights: true,
										fog: true,
										side: THREE.FrontSide
									});

									// Apply the custom shader material
									mesh.material = vignetteShaderMaterial;
									mesh.material.needsUpdate = true;
								}
							}
						}
					});
				globe.controls().enableZoom = false;

				globeInstance = globe;
			})();

			// Cleanup function
			return () => {
				globeInstance = null;
			};
		};
	}

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
					.globeOffset([cfg.globeLeft || 0, cfg.globeTop || 0])
					.pointOfView({ lat: 0, lng: 0, altitude: cfg.povAltitude || 0.5 }, 1000);
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
	{@attach createGlobeAttachment()}
	class="globe-container {className}"
	{...restProps}
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
