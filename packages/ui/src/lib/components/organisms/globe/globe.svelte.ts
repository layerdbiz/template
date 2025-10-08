/**
 * @fileoverview Globe component utilities and types
 * Provides type-safe utilities for the 3D globe visualization component
 */

import type Globe from "globe.gl";

// ============================================================================
// Types
// ============================================================================

export interface Location {
	location: string;
	lat: number | string;
	lng: number | string;
	phone?: string;
	email?: string;
}

export interface Port {
	port: string;
	city: string;
	location: string;
	lat: number | string;
	lng: number | string;
}

export interface Arc {
	startLat: number;
	startLng: number;
	endLat: number;
	endLng: number;
	port?: string;
	city?: string;
	color?: string;
}

export interface Ring {
	lat: number;
	lng: number;
}

export interface Label {
	lat: number;
	lng: number;
	label: string;
	size: number;
	dotRadius: number;
	orientation: "top" | "bottom" | "left" | "right";
}

export interface GlobeConfig {
	// Data URLs
	dataLocations?: string;
	dataPorts?: string;

	// Globe appearance
	imgEarth?: string;
	globeWidth?: number;
	globeHeight?: number;
	globeLeft?: number;
	globeTop?: number;

	// Globe colors
	globeColor?: string;
	emissiveColor?: string;
	emissiveIntensity?: number;

	// Vignette/Shadow
	vignetteEnabled?: boolean;
	vignetteFadeStart?: number; // 0-1, where fade begins (0 = bottom, 1 = top)
	vignetteFadeEnd?: number; // 0-1, where fade ends
	vignetteOpacity?: number; // 0-1, strength of the vignette

	// Camera
	povAltitude?: number;
	povLatitude?: number;

	// Points
	pointAltitude?: number;
	pointColor?: string;

	// Labels
	labelSize?: number;
	labelDotRadius?: number;
	labelTextColor?: string;
	labelDotColor?: string;

	// Rings
	ringColorLocation?: string;
	ringMaxRadius?: number;
	ringPropagationSpeed?: number;
	ringRepeatPeriod?: number;
	ringAltitude?: number;

	// Arcs
	arcRelativeLength?: number;
	arcFlightTime?: number;
	arcNumRings?: number;
	arcStroke?: number;
	arcDashLength?: number;
	arcDashGap?: number;
	arcDashInitialGap?: number;
	arcAltitude?: number | null;
	arcAltitudeAutoscale?: number;
	arcColor?: string;

	// Animation
	animationDuration?: number;

	// Auto-play
	autoPlay?: boolean;
	autoPlayInterval?: number;
	autoPlayPauseOnInteraction?: boolean;
	autoPlayResumeDelay?: number;
}

export interface GlobeProps {
	locations?: Location[];
	ports?: Port[];
	config?: Partial<GlobeConfig>;
	class?: string;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Responsive value selector - returns appropriate value based on window width
 * Different from the global mq utility - this is for selecting static values
 * @internal
 */
function selectResponsiveValue<T>(defaultValue: T, sm?: T, md?: T, lg?: T): T {
	if (typeof window === "undefined") return defaultValue;

	const breakpoints = [
		{ query: "(min-width: 1024px)", value: lg },
		{ query: "(min-width: 768px)", value: md },
		{ query: "(min-width: 640px)", value: sm },
	];

	for (const { query, value } of breakpoints) {
		if (value !== undefined && window.matchMedia(query).matches) {
			return value;
		}
	}

	return defaultValue;
}

/**
 * Creates default globe configuration with responsive values
 * NOTE: This function should NOT access reactive mq values to avoid infinite loops
 * Pass isSmallScreen as a parameter instead
 */
export function createDefaultConfig(
	width: number = typeof window !== "undefined" ? window.innerWidth : 1920,
	height: number = typeof window !== "undefined" ? window.innerHeight : 1080,
	isSmallScreen: boolean = false,
): GlobeConfig {
	// Responsive values based on screen size parameter (not reactive mq)
	const globeWidth = width;
	const globeHeight = height;
	const globeLeft = 0;
	const globeTop = isSmallScreen ? height * 1.72 : height * 0.9;

	// Camera settings
	const povAltitude = isSmallScreen ? 0.2 : 0.8;
	const povLatitude = isSmallScreen ? 21 : 36;

	// Label settings
	const labelSize = isSmallScreen ? 0.25 : 0.75;
	const labelDotRadius = isSmallScreen ? 0.1 : 0.3;

	// Ring settings
	const ringMaxRadius = isSmallScreen ? 2 : 4;
	const ringPropagationSpeed = isSmallScreen ? 2 : 4;

	// Arc settings
	const arcStroke = isSmallScreen ? 0.05 : 0.2;
	const arcAltitude = null;
	const arcAltitudeAutoscale = isSmallScreen ? 0.2 : 0.3;

	return {
		// Globe
		imgEarth: "/images/skins/earth-blue-marble.jpg",
		globeWidth,
		globeHeight,
		globeLeft,
		globeTop,

		// Globe colors
		globeColor: "#3a228a",
		emissiveColor: "#220038",
		emissiveIntensity: 0.1,

		// Vignette/Shadow (gradient from bottom to top)
		vignetteEnabled: true,
		vignetteFadeStart: 0.3, // Start fade at 30% from bottom
		vignetteFadeEnd: 1.0, // Complete fade at top
		vignetteOpacity: 0.7, // 70% opacity for the shadow

		// Position
		povAltitude,
		povLatitude,

		// Points
		pointAltitude: 0.001,
		pointColor: "rgba(0, 0, 255, 1)",

		// Labels
		labelSize,
		labelDotRadius,
		labelTextColor: "rgba(255, 255, 255, 1)",
		labelDotColor: "lime",

		// Rings
		ringColorLocation: "#ffffff",
		ringMaxRadius,
		ringPropagationSpeed,
		ringRepeatPeriod: 1000,
		ringAltitude: 0,

		// Arcs
		arcRelativeLength: 0.4,
		arcFlightTime: 2000,
		arcNumRings: 5,
		arcStroke,
		arcDashLength: 0.6,
		arcDashGap: 2,
		arcDashInitialGap: 1,
		arcAltitude,
		arcAltitudeAutoscale,
		arcColor: "rgba(255, 255, 255, 1)",

		// Animation
		animationDuration: 1000,

		// Auto-play
		autoPlay: true,
		autoPlayInterval: 7000,
		autoPlayPauseOnInteraction: true,
		autoPlayResumeDelay: 60000,
	};
}

/**
 * Avoid label collisions by adjusting orientations
 */
export function avoidLabelCollisions(labels: Label[]): Label[] {
	const grid = new Map<string, Label>();
	const gridSize = 5; // degrees

	const getGridKey = (lat: number, lng: number) => {
		const latGrid = Math.floor(lat / gridSize);
		const lngGrid = Math.floor(lng / gridSize);
		return `${latGrid},${lngGrid}`;
	};

	return labels.map((label) => {
		const key = getGridKey(label.lat, label.lng);

		if (grid.has(key)) {
			const existing = grid.get(key)!;
			if (existing.orientation === "bottom") {
				label.orientation = "top";
			} else if (existing.orientation === "top") {
				label.orientation = "right";
			} else if (existing.orientation === "right") {
				label.orientation = "left";
			} else {
				label.lat += gridSize * 0.2;
				label.orientation = "bottom";
			}
		} else {
			label.orientation = "bottom";
		}

		grid.set(key, label);
		return label;
	});
}

/**
 * Creates ring color with dynamic opacity based on time
 */
export function getRingColor(t: number): string {
	return `rgba(255,255,255,${Math.sqrt(1 - t)})`;
}

/**
 * Auto-play controller
 */
export function createAutoPlay(
	config: GlobeConfig,
	advanceCallback: () => void,
	interactionElements: (HTMLElement | Document | null)[] = [],
) {
	let timer: ReturnType<typeof setInterval> | null = null;
	let pauseTimer: ReturnType<typeof setTimeout> | null = null;
	let active = false;
	let userInteracted = false;

	const clearTimer = () => {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	};

	const clearPauseTimer = () => {
		if (pauseTimer) {
			clearTimeout(pauseTimer);
			pauseTimer = null;
		}
	};

	const startTimer = () => {
		clearTimer();
		if (!userInteracted && config.autoPlay) {
			timer = setInterval(advanceCallback, config.autoPlayInterval);
		}
	};

	const pause = () => {
		if (!config.autoPlayPauseOnInteraction) return;

		userInteracted = true;
		clearTimer();
		clearPauseTimer();

		if (config.autoPlayResumeDelay && config.autoPlayResumeDelay > 0) {
			pauseTimer = setTimeout(() => {
				userInteracted = false;
				if (config.autoPlay && active) {
					startTimer();
				}
			}, config.autoPlayResumeDelay);
		}
	};

	// Setup interaction events
	const interactionEvents = ["click", "touchstart", "mousedown", "keyup"];
	interactionElements.forEach((element) => {
		if (!element) return;
		interactionEvents.forEach((eventType) => {
			element.addEventListener(eventType, pause);
		});
	});

	// Visibility change handler
	if (typeof document !== "undefined") {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") {
				clearTimer();
				clearPauseTimer();
			} else if (
				document.visibilityState === "visible" && config.autoPlay && active
			) {
				startTimer();
			}
		});
	}

	// Return controller function
	return (start = true) => {
		if (!config.autoPlay) return;

		clearTimer();
		active = start;

		if (start) {
			startTimer();
		}

		return {
			stop: () => {
				active = false;
				clearTimer();
				clearPauseTimer();
			},
		};
	};
}

/**
 * Easing functions for animations
 */
export const easing = {
	inQuad: (t: number) => t * t,
	inCubic: (t: number) => t * t * t,
	inPower: (t: number, power = 2) => Math.pow(t, power),
	outQuad: (t: number) => t * (2 - t),
	outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
	inOutQuad: (
		t: number,
	) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
	inOutCubic: (
		t: number,
	) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
	inOutPower: (t: number, power = 3) =>
		t < 0.5 ? Math.pow(2 * t, power) / 2 : 1 - Math.pow(-2 * t + 2, power) / 2,
};

/**
 * Format number with appropriate notation
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat("en-US", { notation: "compact" }).format(num);
}

/**
 * Animate counter with easing
 */
export function animateCounter(
	element: HTMLElement,
	start = 0,
	end: number,
	duration = 2000,
	easingFn = easing.inOutCubic,
	thresholds = { early: 0.85, display: 0.95 },
) {
	let startTime: number | null = null;
	let lastValue = start;

	const step = (timestamp: number) => {
		if (!startTime) startTime = timestamp;
		const linearProgress = Math.min((timestamp - startTime) / duration, 1);

		let currentValue: number;

		if (linearProgress >= thresholds.display) {
			currentValue = end;
			element.textContent = formatNumber(currentValue);
			return;
		} else if (linearProgress >= thresholds.early) {
			const remainingFraction = (linearProgress - thresholds.early) /
				(thresholds.display - thresholds.early);
			const smoothApproach = easing.outCubic(remainingFraction);
			const valueAtEarlyThreshold = Math.floor(
				easing.inOutCubic(thresholds.early) * (end - start) + start,
			);
			const gap = end - valueAtEarlyThreshold;
			currentValue = Math.floor(valueAtEarlyThreshold + gap * smoothApproach);
		} else {
			const easedProgress = easingFn(linearProgress);
			currentValue = Math.floor(easedProgress * (end - start) + start);
		}

		currentValue = Math.min(Math.max(lastValue, currentValue), end);
		lastValue = currentValue;

		element.textContent = formatNumber(currentValue);

		if (linearProgress < 1) {
			requestAnimationFrame(step);
		}
	};

	requestAnimationFrame(step);
}

/**
 * SVG marker template
 */
export const markerSVG =
	`<svg xmlns="http://www.w3.org/2000/svg" class="svg svg-marker" fill="none" viewBox="0 0 87 122">
	<path class="stroke" stroke-width="4" d="m43.0833 115.667-1.4842 1.34 1.4842 1.643 1.4842-1.643-1.4842-1.34Zm0 0c1.4842 1.34 1.4846 1.34 1.4851 1.339l.0018-.002.0062-.007.023-.025.0875-.098c.0764-.085.1886-.211.3343-.376.2914-.33.7167-.816 1.2567-1.442 1.0799-1.254 2.6193-3.074 4.4651-5.348 3.6898-4.546 8.6129-10.9197 13.5399-18.2222 4.9232-7.2969 9.8751-15.5579 13.6022-23.8774 3.7154-8.2933 6.2816-16.7923 6.2816-24.5251A41.0836 41.0836 0 0 0 14.033 14.033 41.0835 41.0835 0 0 0 2 43.0833c0 7.7328 2.5662 16.2318 6.2816 24.5251 3.7271 8.3195 8.679 16.5805 13.6021 23.8774 4.9271 7.3025 9.8501 13.6762 13.5399 18.2222 1.8458 2.274 3.3852 4.094 4.4652 5.348.54.626.9652 1.112 1.2566 1.442.1457.165.258.291.3344.376l.0874.098.023.025.0063.007.0017.002c.0006.001.0009.001 1.4851-1.339Z"/>
	<path class="bg" d="M60 44c0 9.3888-7.6112 17-17 17s-17-7.6112-17-17 7.6112-17 17-17 17 7.6112 17 17Z"/>
	<path class="fg" d="M43.0833 57.0417a13.9584 13.9584 0 1 1 .0001-27.9168 13.9584 13.9584 0 0 1-.0001 27.9168Zm0-53.0417a39.0837 39.0837 0 0 0-27.6361 11.4472A39.0837 39.0837 0 0 0 4 43.0833c0 29.3125 39.0833 72.5837 39.0833 72.5837s39.0834-43.2712 39.0834-72.5837A39.0834 39.0834 0 0 0 43.0833 4Z"/>
</svg>`;
