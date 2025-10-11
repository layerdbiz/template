<!--
@component Globe
@tags organism, 3d, visualization, interactive, map, globe
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { Image, mq } from '@layerd/ui';
	import { untrack } from 'svelte';
	import * as THREE from 'three';
	import Globe from 'globe.gl';
	import {
		type GlobeProps,
		type Location,
		type Port,
		createDefaultConfig,
		mergeConfigs
	} from '@layerd/ui';

	let {
		locations = $bindable([]),
		startLocationId,
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
	let currentIndex = $state(-1); // Start with -1 (no active location) until we find the starting location
	let previousLocation: Location | null = $state(null);
	let displayPreviousLocation: Location | null = $state(null); // Visual previous location for point transitions
	let windowWidth = $state(1920);
	let windowHeight = $state(1080);
	let processedLocations = $state<Location[]>([]);
	let processedPorts = $state<Port[]>([]);
	let activeArcs = $state<any[]>([]); // Track all active arcs
	let arcCleanupTimeouts = $state<Map<string, ReturnType<typeof setTimeout>>>(new Map()); // Track cleanup timeouts per arc
	let activeRings = $state<any[]>([]); // Track all active rings

	// Track media query breakpoints for recreation
	let lastMqSm = $state(mq.sm);
	let lastMqMd = $state(mq.md);
	let lastMqLg = $state(mq.lg);
	let lastMqXl = $state(mq.xl);

	// Store marker elements for class toggling
	let markerElements = $state<Map<string, HTMLElement>>(new Map());

	// Track if current navigation was from a user click (for immediate activation)
	let wasClickNavigation = $state(false);

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

	// Fetch ports data
	$effect(() => {
		const ports = mergedConfig.data?.ports;
		if (typeof ports === 'string') {
			fetch(ports)
				.then((res) => res.json())
				.then((data) => {
					processedPorts = data;
					console.log('✅ Ports fetched:', data.length, 'ports');
				})
				.catch((err) => console.error('Failed to fetch ports:', err));
		} else if (Array.isArray(ports)) {
			processedPorts = ports;
			console.log('✅ Ports set from array:', ports.length, 'ports');
		} else {
			processedPorts = [];
			console.log('⚠️ No ports data provided');
		}
	});

	// Set initial location index when locations are loaded
	// This runs BEFORE the globe is rendered to avoid showing the first location as active
	$effect(() => {
		// Only run once when locations are first loaded and currentIndex is still -1
		if (processedLocations.length > 0 && currentIndex === -1) {
			if (startLocationId !== undefined) {
				// Find location by id
				const foundIndex = processedLocations.findIndex(
					(loc) => String(loc.id) === String(startLocationId)
				);
				if (foundIndex !== -1) {
					currentIndex = foundIndex;
					console.log(
						`🎯 Starting at location with id "${startLocationId}" (index ${foundIndex}):`,
						processedLocations[foundIndex].location
					);
				} else {
					console.warn(`⚠️ Location with id "${startLocationId}" not found, starting at index 0`);
					currentIndex = 0;
				}
			} else {
				// No startLocationId specified, default to first location
				currentIndex = 0;
				console.log('🎯 Starting at first location (index 0)');
			}
		}
	});

	// Get locations and ports from data config or direct props
	const effectiveLocations = $derived(processedLocations);

	// Current location and ports
	const currentLocation = $derived(effectiveLocations[currentIndex] || null);

	// Active location as array for points rendering
	const activeLocationArray = $derived(currentLocation ? [currentLocation] : []);

	// Get ports for current location
	const currentPorts = $derived(
		currentLocation
			? processedPorts.filter((port) => port.location === currentLocation.location)
			: []
	);

	// Debug: Log when currentPorts changes
	$effect(() => {
		console.log('🔍 Current ports updated:', {
			location: currentLocation?.location,
			totalPorts: processedPorts.length,
			matchingPorts: currentPorts.length,
			ports: currentPorts
		});
	});

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
	 * Add a ripple ring at a specific location
	 * Called when arc endpoint reaches its destination
	 */
	function addRingAtLocation(location: Location) {
		if (!globeInstance) return;

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const ringsConfig = cfg.rings;
		const arcsConfig = cfg.arcs;

		if (!ringsConfig) return;

		// Create unique ring ID for tracking
		const ringId = `${location.lat},${location.lng}-${Date.now()}`;

		// Create new ring data
		const newRing = {
			id: ringId,
			lat: parseFloat(String(location.lat)),
			lng: parseFloat(String(location.lng))
		};

		// Add new ring to active rings array
		activeRings = [...activeRings, newRing];

		// Get ring configuration
		const radius = ringsConfig.radius ?? 2;
		const speed = ringsConfig.speed ?? 2;
		const stroke = ringsConfig.stroke;
		const numRings = ringsConfig.rings ?? 3;
		const arcDuration = arcsConfig?.duration ?? 2000;
		const arcDashLength = arcsConfig?.dashLength ?? 0.6;

		// Calculate ring duration based on arc dash length if not explicitly set
		const ringDuration = ringsConfig.duration ?? arcDuration * arcDashLength;

		// Calculate repeat period to show multiple rings
		const repeatPeriod = ringsConfig.repeat ?? ringDuration / numRings;

		// Configure ring visualization with all active rings
		const ringColor =
			typeof ringsConfig.color === 'function'
				? ringsConfig.color
				: (t: number) => {
						const baseColor = ringsConfig.color ?? '#ffffff';
						// Parse color and apply fade (only if baseColor is a string)
						if (typeof baseColor === 'string' && baseColor.startsWith('#')) {
							// Convert hex to rgb and apply opacity fade
							const r = parseInt(baseColor.slice(1, 3), 16);
							const g = parseInt(baseColor.slice(3, 5), 16);
							const b = parseInt(baseColor.slice(5, 7), 16);
							return `rgba(${r},${g},${b},${1 - t})`;
						}
						return typeof baseColor === 'string' ? baseColor : '#ffffff';
					};

		globeInstance
			.ringsData(activeRings)
			.ringColor(() => ringColor)
			.ringMaxRadius(radius)
			.ringPropagationSpeed(speed)
			.ringRepeatPeriod(repeatPeriod)
			.ringAltitude(ringsConfig.altitude ?? 0.003);

		// Remove ring after animation completes
		setTimeout(() => {
			// Remove this ring from active rings
			activeRings = activeRings.filter((ring) => ring.id !== ringId);

			// Update globe with remaining rings
			if (globeInstance) {
				globeInstance.ringsData(activeRings);
			}
		}, ringDuration);
	}

	/**
	 * Animate arc between two locations
	 */
	function animateArcTransition(fromLocation: Location, toLocation: Location) {
		if (!globeInstance) return;

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const arcsConfig = cfg.arcs;

		if (!arcsConfig) return;

		// Create unique arc ID for tracking
		const arcId = `${fromLocation.lat},${fromLocation.lng}-${toLocation.lat},${toLocation.lng}-${Date.now()}`;

		// Create new arc data
		const newArc = {
			id: arcId,
			startLat: parseFloat(String(fromLocation.lat)),
			startLng: parseFloat(String(fromLocation.lng)),
			endLat: parseFloat(String(toLocation.lat)),
			endLng: parseFloat(String(toLocation.lng))
		};

		// Get dash configuration
		const dashLength = arcsConfig.dashLength ?? 0.6;
		const dashGap = arcsConfig.dashGap ?? 2;
		const dashInitialGap = arcsConfig.dashInitialGap ?? 1;
		const duration = arcsConfig.duration ?? 2000;

		// Calculate total dash cycle length (dash + gap)
		const totalDashCycle = dashLength + dashGap;

		// The time it takes for the full dash pattern (including gap) to traverse the arc
		const fullAnimationTime = duration * (1 + dashGap / totalDashCycle);

		// Add new arc to active arcs array
		activeArcs = [...activeArcs, newArc];

		// Configure arc visualization with all active arcs
		globeInstance
			.arcsData(activeArcs)
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

		// Trigger ring animation when arc endpoint reaches destination
		// This happens after the dash completes its journey (at 'duration' time, not fullAnimationTime)
		setTimeout(() => {
			addRingAtLocation(toLocation);
		}, duration);

		// Schedule cleanup for this specific arc after the full animation completes
		const cleanupTimeout = setTimeout(() => {
			// Remove this arc from active arcs
			activeArcs = activeArcs.filter((arc) => arc.id !== arcId);

			// Update globe with remaining arcs
			if (globeInstance) {
				globeInstance.arcsData(activeArcs);
			}

			// Clean up timeout reference
			arcCleanupTimeouts.delete(arcId);
		}, fullAnimationTime);

		// Store timeout reference for potential cleanup
		arcCleanupTimeouts.set(arcId, cleanupTimeout);
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
				displayPreviousLocation = location; // Initialize displayPreviousLocation too
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
			// Capture the OLD previous location for visual transitions
			const visualPrevLoc = prevLoc;

			// Update previousLocation immediately for arc/marker logic
			untrack(() => {
				previousLocation = location;
			});

			// Animate arc from previous to current location
			animateArcTransition(visualPrevLoc, location);

			// Update globe view
			globe.pointOfView(
				{
					lat: parseFloat(String(location.lat)) - (cfg.globe?.latitude ?? 0),
					lng: parseFloat(String(location.lng)),
					altitude: cfg.globe?.altitude ?? 0.25
				},
				cfg.animation?.duration ?? 1000
			);

			// Update displayPreviousLocation AFTER arc completes for smooth point transitions
			const arcDuration = cfg.arcs?.duration ?? 2000;
			setTimeout(() => {
				untrack(() => {
					displayPreviousLocation = location;
				});
			}, arcDuration);
		}
	});

	// Update markers when current location changes
	$effect(() => {
		const loc = currentLocation;
		const prevLoc = previousLocation;
		if (!loc) return;

		const currentLat = parseFloat(String(loc.lat));
		const currentLng = parseFloat(String(loc.lng));

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const arcDuration = cfg.arcs?.duration ?? 2000;

		// Determine delay: no delay for first location (no arc), otherwise wait for arc to arrive
		const isFirstLocation = !prevLoc;

		// IMMEDIATELY remove active class from all markers
		markerElements.forEach((markerEl, key) => {
			const marker = markerEl.querySelector('.svg-marker');
			const markerWrapper = markerEl.closest('.globe-marker');
			const label = markerWrapper?.querySelector('.location-label') as HTMLElement;
			if (!marker) return;

			const [lat, lng] = key.split(',').map(Number);
			const isThisLocationActive = lat === currentLat && lng === currentLng;

			// Remove active class immediately from all non-active markers
			if (!isThisLocationActive) {
				marker.classList.remove('active');
				if (label) {
					label.classList.remove('opacity-100');
					label.classList.add('opacity-0');
				}
			}
		});

		// Add active class to new location with appropriate delay
		const delay = isFirstLocation || wasClickNavigation ? 0 : arcDuration;

		setTimeout(() => {
			markerElements.forEach((markerEl, key) => {
				const marker = markerEl.querySelector('.svg-marker');
				const markerWrapper = markerEl.closest('.globe-marker');
				const label = markerWrapper?.querySelector('.location-label') as HTMLElement;
				if (!marker) return;

				const [lat, lng] = key.split(',').map(Number);
				const isActive = lat === currentLat && lng === currentLng;

				// Add active class only if this is the active location
				if (isActive) {
					marker.classList.add('active');
					if (label) {
						label.classList.remove('opacity-0');
						label.classList.add('opacity-100');
					}
				}
			});

			// Reset the click navigation flag after use
			untrack(() => {
				wasClickNavigation = false;
			});
		}, delay);
	});

	// Render all labels once when globe initializes, then control visibility via opacity
	let labelsInitialized = $state(false);
	let labelOpacityMap = $state<Map<string, number>>(new Map());

	// Initialize all labels once when globe is ready
	$effect(() => {
		const globe = globeInstance;
		if (!globe || labelsInitialized) return;

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const labelsConfig = cfg.labels;

		if (!labelsConfig) {
			console.log('⚠️ No labels config provided');
			return;
		}

		// Get all unique ports from all locations
		const allPorts = new Set<string>();
		const portsByKey = new Map<string, Port>();

		effectiveLocations.forEach((location) => {
			const portsForLocation = processedPorts.filter((p: Port) => p.location === location.location);
			portsForLocation.forEach((port: Port) => {
				const key = `${port.lat},${port.lng}`;
				if (!allPorts.has(key)) {
					allPorts.add(key);
					portsByKey.set(key, port);
				}
			});
		});

		// Create label data for all ports (starting with opacity 0)
		const allLabelData = Array.from(portsByKey.values()).map((port) => ({
			lat: parseFloat(String(port.lat)),
			lng: parseFloat(String(port.lng)),
			city: port.city,
			port: port.port,
			orientation: 'bottom',
			opacity: 0 // Start invisible
		}));

		// Initialize opacity map (all labels start at 0)
		const initialOpacityMap = new Map<string, number>();
		allLabelData.forEach((label) => {
			const key = `${label.lat},${label.lng}`;
			initialOpacityMap.set(key, 0);
		});
		labelOpacityMap = initialOpacityMap;

		console.log('🏷️ Initializing all labels:', allLabelData.length, 'labels');

		// Set all labels at once (they'll be invisible initially)
		globe.labelsData(allLabelData);
		labelsInitialized = true;

		console.log('✅ All labels initialized (invisible)');
	});

	// Update label visibility when current location changes
	$effect(() => {
		const globe = globeInstance;
		const ports = currentPorts;
		const loc = currentLocation;
		const prevLoc = previousLocation;

		if (!globe || !loc || !labelsInitialized) return;

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const labelsConfig = cfg.labels;
		const arcDuration = cfg.arcs?.duration ?? 2000;
		const ringDuration = cfg.rings?.duration ?? 700;

		console.log('🏷️ Label visibility update triggered:', {
			location: loc?.location,
			portsCount: ports.length,
			hasLabelsConfig: !!labelsConfig,
			isFirstLocation: !prevLoc
		});

		if (!labelsConfig) {
			return;
		}

		// Determine delay: no delay for first location (no arc), otherwise wait for arc to arrive
		const isFirstLocation = !prevLoc;

		// IMMEDIATELY fade out all labels with smooth animation
		const scene = globe.scene();
		const fadeDuration = 300; // 300ms smooth fade

		scene.traverse((object: any) => {
			if (object.userData && object.userData.__data && object.userData.__data.city) {
				const labelData = object.userData.__data;
				const key = `${labelData.lat},${labelData.lng}`;

				// Smooth fade out using animation frame
				if (object.material && object.material.opacity > 0) {
					const startOpacity = object.material.opacity;
					const startTime = Date.now();

					const animate = () => {
						const elapsed = Date.now() - startTime;
						const progress = Math.min(elapsed / fadeDuration, 1);
						const currentOpacity = startOpacity * (1 - progress);

						if (object.material) {
							object.material.opacity = currentOpacity;
							object.material.transparent = true;
							object.material.needsUpdate = true;
						}

						if (progress < 1) {
							requestAnimationFrame(animate);
						} else {
							labelOpacityMap.set(key, 0);
						}
					};

					requestAnimationFrame(animate);
				} else if (object.material) {
					object.material.opacity = 0;
					object.material.transparent = true;
					object.material.needsUpdate = true;
					labelOpacityMap.set(key, 0);
				}
			}
		});

		console.log('🏷️ All labels fading out smoothly');

		// Calculate delay for fading in labels at current location
		const baseDelay = isFirstLocation || wasClickNavigation ? 0 : arcDuration;
		const ringBuffer = isFirstLocation || wasClickNavigation ? 0 : ringDuration + 1000;
		const labelDelay = baseDelay + ringBuffer;

		console.log('🏷️ Label fade-in delay calculated:', labelDelay, 'ms');

		if (ports.length > 0) {
			setTimeout(() => {
				const scene = globe.scene();

				// Fade in labels for current location with smooth animation
				scene.traverse((object: any) => {
					if (object.userData && object.userData.__data && object.userData.__data.city) {
						const labelData = object.userData.__data;
						const key = `${labelData.lat},${labelData.lng}`;

						// Check if this label belongs to current location's ports
						const shouldShow = ports.some((port) => {
							const portKey = `${parseFloat(String(port.lat))},${parseFloat(String(port.lng))}`;
							return portKey === key;
						});

						if (shouldShow && object.material) {
							const startOpacity = object.material.opacity || 0;
							const startTime = Date.now();

							const animate = () => {
								const elapsed = Date.now() - startTime;
								const progress = Math.min(elapsed / fadeDuration, 1);
								const currentOpacity = startOpacity + (1 - startOpacity) * progress;

								if (object.material) {
									object.material.opacity = currentOpacity;
									object.material.transparent = true;
									object.material.needsUpdate = true;
								}

								if (progress < 1) {
									requestAnimationFrame(animate);
								} else {
									labelOpacityMap.set(key, 1);
								}
							};

							requestAnimationFrame(animate);
						}
					}
				});

				console.log('🏷️ Labels fading in smoothly for current location');
			}, labelDelay);
		}
	});

	// Update points when active location changes
	$effect(() => {
		const globe = globeInstance;
		const activeLocation = activeLocationArray;
		const prevLoc = displayPreviousLocation; // Use displayPreviousLocation for visual transitions
		const loc = currentLocation;

		if (!globe) return;

		// Use untrack to read config without creating dependency
		const cfg = untrack(() => mergedConfig);
		const arcDuration = cfg.arcs?.duration ?? 2000;

		// Determine delay: no delay ONLY for first location (no previous location = no arc)
		// For all subsequent navigations (keyboard OR click), ALWAYS wait for arc to complete
		const isFirstLocation = !prevLoc;
		const delay = isFirstLocation ? 0 : arcDuration;

		console.log('📍 Updating points for active location:', {
			currentLocation: loc?.location,
			displayPreviousLocation: prevLoc?.location,
			activeLocation,
			delay,
			isFirstLocation,
			hasPreviousLocation: !!prevLoc,
			willShowBothPoints: !isFirstLocation && prevLoc && delay > 0
		});

		// POINTS LAYER RENDERING
		// Support both single layer (backward compatible) and multiple layers
		const pointLayers = cfg.points?.layers || [
			{
				altitude: cfg.points?.altitude ?? 0.003,
				base: cfg.points?.base ?? cfg.points?.base ?? 0,
				color: cfg.points?.color ?? '#0066ff',
				radius: cfg.points?.radius ?? 0.25,
				zOffset: 0
			}
		];

		// Check if any layer needs base or if we have multiple layers
		const needsCustomObjects =
			pointLayers.some((layer) => {
				const baseAlt = layer.base ?? layer.base ?? 0;
				return baseAlt > 0;
			}) || pointLayers.length > 1;

		// ALWAYS show both points during arc animation (previous + current)
		// This ensures the arc visually emerges from the previous point and lands on the new point
		const locationsToShow =
			!isFirstLocation && prevLoc && delay > 0 ? [prevLoc, loc] : activeLocation;

		console.log('📍 Locations to show:', {
			showingBothPoints: locationsToShow.length > 1,
			locations: locationsToShow.map((l: Location) => l.location)
		});

		// Update points immediately based on displayPreviousLocation state
		// When displayPreviousLocation updates (after arc completes), this effect will re-run automatically
		// and locationsToShow will be recalculated to show only the active location
		if (needsCustomObjects) {
			// Use 3D Objects Layer for elevated points or multi-layer points
			const layeredLocations = locationsToShow.flatMap((location: Location) =>
				pointLayers.map((layer, layerIndex) => ({
					...location,
					__layerIndex: layerIndex,
					__layerConfig: layer
				}))
			);

			globe.objectsData(layeredLocations);
			console.log('✅ Points updated:', layeredLocations.length, 'layers');
		} else {
			// Use standard Points Layer
			globe.pointsData(locationsToShow);
			console.log('✅ Points updated:', locationsToShow.length, 'points');
		}
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

			// Clear all arc cleanup timeouts and active arcs
			arcCleanupTimeouts.forEach((timeout) => clearTimeout(timeout));
			arcCleanupTimeouts.clear();
			activeArcs = [];

			// Clear all rings
			activeRings = [];

			// Reset labels initialization flag so labels will be recreated
			labelsInitialized = false;
			labelOpacityMap = new Map();

			// Update tracking variables
			lastMqSm = currentMqSm;
			lastMqMd = currentMqMd;
			lastMqLg = currentMqLg;
			lastMqXl = currentMqXl;

			// Reset previousLocation so the location-centering effect runs again
			previousLocation = null;
			displayPreviousLocation = null;

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

			// COUNTRY OUTLINES - MULTI-LAYER SUPPORT
			if (cfg.data?.polygons) {
				fetch(cfg.data.polygons)
					.then((res) => res.json())
					.then((data) => {
						if (!globe) return;

						// HEXAGONS: Base solid countries (low altitude)
						if (cfg.hexPolygon) {
							globe
								.hexPolygonsData(data.features || data)
								.hexPolygonGeoJsonGeometry('geometry')
								.hexPolygonResolution(cfg.hexPolygon?.resolution ?? 4)
								.hexPolygonMargin(cfg.hexPolygon?.margin ?? 0.15)
								.hexPolygonAltitude(cfg.hexPolygon?.altitude ?? 0)
								.hexPolygonColor(
									typeof cfg.hexPolygon?.color === 'function'
										? cfg.hexPolygon.color
										: () => cfg.hexPolygon?.color ?? '#181e2b'
								)
								.hexPolygonsTransitionDuration(cfg.hexPolygon?.transitionDuration ?? 0);
							console.log('🔷 Hexagon base countries configured');
						}

						// POLYGONS: Blue glow effect (higher altitude, transparent cap, glowing sides)
						if (cfg.polygon) {
							const sideColor = cfg.polygon.sideColor ?? 'rgba(21, 93, 252, 0.6)'; // Blue with 60% opacity
							const capColor = cfg.polygon.capColor ?? 'rgba(0, 0, 0, 0)'; // Fully transparent

							globe
								.polygonsData(data.features || data)
								.polygonCapColor(typeof capColor === 'function' ? capColor : () => capColor)
								.polygonSideColor(typeof sideColor === 'function' ? sideColor : () => sideColor)
								.polygonStrokeColor(() => 'rgba(0,0,0,0)') // No stroke
								.polygonAltitude(cfg.polygon.altitude ?? 0.01)
								.polygonsTransitionDuration(cfg.polygon.transitionDuration ?? 0);

							console.log('✨ Polygon glow effect configured');
						}
					})
					.catch((err) => console.error('Failed to load polygon data:', err));
			} // POINTS LAYER RENDERING
			// Support both single layer (backward compatible) and multiple layers
			const pointLayers = cfg.points?.layers || [
				{
					altitude: cfg.points?.altitude ?? 0.003,
					base: cfg.points?.base ?? cfg.points?.base ?? 0, // Support both property names
					color: cfg.points?.color ?? '#0066ff',
					radius: cfg.points?.radius ?? 0.25,
					zOffset: 0
				}
			];

			// Check if any layer needs base or if we have multiple layers
			const needsCustomObjects =
				pointLayers.some((layer) => {
					const baseAlt = layer.base ?? layer.base ?? 0;
					return baseAlt > 0;
				}) || pointLayers.length > 1;

			if (needsCustomObjects) {
				// Use 3D Objects Layer for elevated points or multi-layer points
				// Create a separate object for each layer at each location
				const layeredLocations = activeLocationArray.flatMap((loc: Location) =>
					pointLayers.map((layer, layerIndex) => ({
						...loc,
						__layerIndex: layerIndex,
						__layerConfig: layer
					}))
				);

				globe
					.objectsData(layeredLocations)
					.objectLat((d: any) => d.lat)
					.objectLng((d: any) => d.lng)
					.objectAltitude((d: any) => {
						// Support both base and base property names
						const base = d.__layerConfig.base ?? d.__layerConfig.base ?? 0;
						return base;
					})
					.objectThreeObject((d: any) => {
						const layer = d.__layerConfig;
						const pointAltitude = layer.altitude ?? 0.003;
						const pointColor = layer.color ?? '#0066ff';
						const pointRadius = layer.radius ?? 0.25;
						const zOffset = layer.zOffset ?? 0;

						// Create cylinder geometry
						const geometry = new THREE.CylinderGeometry(
							pointRadius, // radiusTop
							pointRadius, // radiusBottom
							pointAltitude * 100, // height (scaled to match globe radius)
							12, // radialSegments
							1, // heightSegments
							false // openEnded
						);

						// Rotate to align with globe surface normal
						geometry.rotateX(Math.PI / 2);

						// Apply z-offset for layering (smaller z renders behind)
						if (zOffset !== 0) {
							geometry.translate(0, 0, zOffset);
						}

						// Create material
						const material = new THREE.MeshBasicMaterial({
							color: pointColor,
							transparent: false,
							depthTest: true,
							depthWrite: true
						});

						const mesh = new THREE.Mesh(geometry, material);

						// Set render order based on layer index (lower index = rendered first = behind)
						mesh.renderOrder = d.__layerIndex;

						return mesh;
					});
			} else {
				// Use standard Points Layer when no base and single layer
				const singleLayer = pointLayers[0];
				globe
					.pointsData(activeLocationArray)
					.pointAltitude(() => singleLayer.altitude ?? 0.003)
					.pointColor(() => singleLayer.color ?? '#0066ff')
					.pointRadius(singleLayer.radius ?? 0.25);
			}

			globe
				// HTML - Location markers with click handlers
				.htmlElementsData(effectiveLocations)
				.htmlElement((d: any) => {
					// Check if this is the currently active location (based on currentIndex, not first in array)
					const isActiveLocation =
						currentLocation &&
						parseFloat(String(d.lat)) === parseFloat(String(currentLocation.lat)) &&
						parseFloat(String(d.lng)) === parseFloat(String(currentLocation.lng));

					const wrapper = document.createElement('div');
					wrapper.innerHTML = `
						<div class="globe-marker relative flex flex-col items-center justify-center pointer-events-none">
							<i class="globe-marker-icon pointer-events-auto cursor-pointer block" 
							     data-lat="${d.lat}" 
							     data-lng="${d.lng}">
								
									 <svg xmlns="http://www.w3.org/2000/svg" class="svg svg-marker translate-y-4 md:translate-y-0 w-6 h-6 md:w-9 md:h-9 origin-bottom cursor-pointer duration-300 ${isActiveLocation ? 'active' : ''}" fill="none" viewBox="0 0 87 122">
										<path class="stroke" stroke-width="4" d="m43.0833 115.667-1.4842 1.34 1.4842 1.643 1.4842-1.643-1.4842-1.34Zm0 0c1.4842 1.34 1.4846 1.34 1.4851 1.339l.0018-.002.0062-.007.023-.025.0875-.098c.0764-.085.1886-.211.3343-.376.2914-.33.7167-.816 1.2567-1.442 1.0799-1.254 2.6193-3.074 4.4651-5.348 3.6898-4.546 8.6129-10.9197 13.5399-18.2222 4.9232-7.2969 9.8751-15.5579 13.6022-23.8774 3.7154-8.2933 6.2816-16.7923 6.2816-24.5251A41.0836 41.0836 0 0 0 14.033 14.033 41.0835 41.0835 0 0 0 2 43.0833c0 7.7328 2.5662 16.2318 6.2816 24.5251 3.7271 8.3195 8.679 16.5805 13.6021 23.8774 4.9271 7.3025 9.8501 13.6762 13.5399 18.2222 1.8458 2.274 3.3852 4.094 4.4652 5.348.54.626.9652 1.112 1.2566 1.442.1457.165.258.291.3344.376l.0874.098.023.025.0063.007.0017.002c.0006.001.0009.001 1.4851-1.339Z"/>
										<path class="bg fill-white" d="M60 44c0 9.3888-7.6112 17-17 17s-17-7.6112-17-17 7.6112-17 17-17 17 7.6112 17 17Z"/>
										<path class="fg fill-primary-600" d="M43.0833 57.0417a13.9584 13.9584 0 1 1 .0001-27.9168 13.9584 13.9584 0 0 1-.0001 27.9168Zm0-53.0417a39.0837 39.0837 0 0 0-27.6361 11.4472A39.0837 39.0837 0 0 0 4 43.0833c0 29.3125 39.0833 72.5837 39.0833 72.5837s39.0834-43.2712 39.0834-72.5837A39.0834 39.0834 0 0 0 43.0833 4Z"/>
									</svg>
							</i>
							<h4 class="location-label font-semibold uppercase flex items-center justify-center gap-2 absolute top-full translate-y-full mt-2 text-xs md:text-sm font-normal text-white m-0 p-2 bg-black/60 rounded whitespace-nowrap pointer-events-none ${isActiveLocation ? 'opacity-100' : 'opacity-0'} transition-all duration-300">
								<i class="text-sm md:text-xl icon-${d.flag}"></i>
								<span>${d.location || 'Unknown Location'}</span>
							</h4>
						</div>
					`;

					const marker = wrapper.querySelector('.globe-marker-icon') as HTMLElement;

					// Apply attachment for lifecycle tracking
					const markerKey = createMarkerAttachment(
						parseFloat(String(d.lat)),
						parseFloat(String(d.lng))
					);
					markerKey(marker);

					marker.onclick = () => {
						const idx = effectiveLocations.findIndex(
							(loc) =>
								parseFloat(String(loc.lat)) === parseFloat(String(d.lat)) &&
								parseFloat(String(loc.lng)) === parseFloat(String(d.lng))
						);
						if (idx >= 0) {
							// Set flag to bypass arc delay for immediate activation
							wasClickNavigation = true;
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

					return wrapper.firstElementChild as HTMLElement;
				})
				.htmlLat((d: any) => d.lat)
				.htmlLng((d: any) => d.lng)
				.htmlAltitude(cfg.html?.altitude ?? 0.02);

			// LABELS - Configure labels layer with opacity-based visibility
			const labelsConfig = cfg.labels;
			console.log('🏷️ Configuring labels layer:', labelsConfig);
			if (labelsConfig) {
				globe
					.labelsData([]) // Start with no labels (will be populated by effect)
					.labelLat((d: any) => d.lat)
					.labelLng((d: any) => d.lng)
					.labelText((d: any) => d.city || d.port || 'Unknown')
					.labelSize((d: any) => labelsConfig.size ?? 0.5)
					.labelDotRadius((d: any) => labelsConfig.dotRadius ?? 0.2)
					.labelColor((d: any) => {
						// Use opacity from labelOpacityMap to control visibility
						const key = `${d.lat},${d.lng}`;
						const opacity = labelOpacityMap.get(key) ?? 0;
						const baseColor = labelsConfig.textColor ?? '#ffffff';

						// Convert hex/named color to rgba with opacity
						if (baseColor.startsWith('#')) {
							// Hex color
							const r = parseInt(baseColor.slice(1, 3), 16);
							const g = parseInt(baseColor.slice(3, 5), 16);
							const b = parseInt(baseColor.slice(5, 7), 16);
							return `rgba(${r}, ${g}, ${b}, ${opacity})`;
						} else if (baseColor.startsWith('rgb')) {
							// Already rgb/rgba - replace opacity
							return baseColor.replace(/rgba?\([^)]+\)/, (match) => {
								const values = match.match(/\d+/g);
								if (values && values.length >= 3) {
									return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
								}
								return match;
							});
						} else {
							// Named color - default to white with opacity
							return `rgba(255, 255, 255, ${opacity})`;
						}
					})
					.labelDotOrientation((d: any) => d.orientation || labelsConfig.orientation || 'bottom')
					.labelAltitude(labelsConfig.altitude ?? 0.01)
					.labelResolution(labelsConfig.resolution ?? 20);
				console.log('✅ Labels layer configured with opacity control');
			} else {
				console.log('⚠️ No labels config - skipping labels layer');
			}

			// Set globeInstance BEFORE onGlobeReady so location-centering effect can access it
			globe.controls().enableZoom = false;
			globeInstance = globe; // FIRST LOAD - Triggered after globe is fully initialized
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

				console.log('🌍 Globe is ready! Current location:', currentLocation?.location);
			});
		} catch (error) {
			console.error('Failed to initialize Globe.gl:', error);
			// Display user-friendly error message
			if (globeContainer) {
				globeContainer.innerHTML = `
					<div class="flex items-center justify-center h-full text-white text-center p-4">
						<h3>Unable to load Globe</h3>
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

			// Clear all arc cleanup timeouts
			arcCleanupTimeouts.forEach((timeout) => clearTimeout(timeout));
			arcCleanupTimeouts.clear();
			activeArcs = [];

			// Clear all rings
			activeRings = [];

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

<Image
	bg
	class="-z-1 pointer-events-none h-svh w-svw overflow-clip"
	overlay="bg-radial from-primary to-transparent from-30% to-60% translate-y-1/2 scale-x-125 absolute bottom-0 origin-bottom opacity-60 hidden md:block"
/>
<div
	class="globe-container w-svh relative h-svh {className}"
	{@attach attachGlobeContainer}
></div>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	/* SVG Marker (active) */
	:global {
		.svg-marker.active {
			@apply md:scale-250 scale-200 inline-block translate-y-2 md:-translate-y-2;
			animation: float 6s ease-in-out infinite;
		}

		.svg-marker.active .stroke {
			@apply stroke-white;
		}

		.svg-marker.active .bg {
			@apply fill-white;
		}
		/* 		
		.svg-marker.active .fg {
			@apply fill-primary-500;
		} */

		.svg-marker:not(.active):hover {
			@apply scale-105;
		}
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
