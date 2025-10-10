/**
 * @fileoverview Globe component utilities and types
 * Provides type-safe utilities for the 3D globe visualization component
 */

import type Globe from "globe.gl";
import { mq } from "@layerd/ui";

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

// ============================================================================
// New Nested Configuration Interfaces
// ============================================================================

export interface GlobeDataConfig {
	locations?: Location[] | string;
	ports?: Port[] | string;
	hexPolygons?: string;
	polygons?: string;
}

export interface GlobeAppearanceConfig {
	image?: string;
	width?: number;
	height?: number;
	left?: number;
	top?: number;
	altitude?: number;
	latitude?: number;
}

export interface GlobeAtmosphereConfig {
	show?: boolean;
	color?: string;
	altitude?: number;
}

export interface GlobeHexPolygonConfig {
	resolution?: number;
	margin?: number;
	color?: string | ((properties: any) => string);
	altitude?: number;
	curvatureResolution?: number;
}

export interface GlobePolygonConfig {
	capColor?: string | ((properties: any) => string);
	sideColor?: string | ((properties: any) => string);
	strokeColor?: string | ((properties: any) => string);
	altitude?: number;
	capCurvatureResolution?: number;
	sideResolution?: number;
	transitionDuration?: number;
}

export interface GlobeVignetteConfig {
	enabled?: boolean;
	fadeStart?: number;
	fadeEnd?: number;
	opacity?: number;
}

export interface GlobePointsConfig {
	altitude?: number;
	color?: string;
}

export interface GlobeLabelsConfig {
	size?: number;
	dotRadius?: number;
	textColor?: string;
	dotColor?: string;
	orientation?: "top" | "bottom" | "left" | "right";
	altitude?: number;
}

export interface GlobeRingsConfig {
	color?: string;
	maxRadius?: number;
	propagationSpeed?: number;
	repeatPeriod?: number;
	altitude?: number;
}

export interface GlobeArcsConfig {
	relativeLength?: number;
	flightTime?: number;
	numRings?: number;
	stroke?: number;
	dashLength?: number;
	dashGap?: number;
	dashInitialGap?: number;
	altitude?: number | null;
	altitudeAutoscale?: number;
	color?: string;
	startAltitude?: number;
	endAltitude?: number;
}

export interface GlobeAnimationConfig {
	duration?: number;
}

export interface GlobeAutoPlayConfig {
	enabled?: boolean;
	interval?: number;
	pauseOnInteraction?: boolean;
	resumeDelay?: number;
}

export interface GlobeHtmlConfig {
	altitude?: number;
}

export interface GlobeConfig {
	data?: GlobeDataConfig;
	globe?: GlobeAppearanceConfig;
	atmosphere?: GlobeAtmosphereConfig;
	hexPolygon?: GlobeHexPolygonConfig;
	polygon?: GlobePolygonConfig;
	vignette?: GlobeVignetteConfig;
	points?: GlobePointsConfig;
	labels?: GlobeLabelsConfig;
	rings?: GlobeRingsConfig;
	arcs?: GlobeArcsConfig;
	animation?: GlobeAnimationConfig;
	autoplay?: GlobeAutoPlayConfig;
	html?: GlobeHtmlConfig;
}

export interface Label {
	lat: number;
	lng: number;
	label: string;
	size: number;
	dotRadius: number;
	orientation: "top" | "bottom" | "left" | "right";
}

export interface GlobeProps {
	locations?: Location[] | string;
	ports?: Port[] | string;
	config?: GlobeConfig;
	class?: string;

	// Direct prop overrides for convenience
	data?: GlobeDataConfig;
	globe?: GlobeAppearanceConfig;
	atmosphere?: GlobeAtmosphereConfig;
	hexPolygon?: GlobeHexPolygonConfig;
	polygon?: GlobePolygonConfig;
	vignette?: GlobeVignetteConfig;
	points?: GlobePointsConfig;
	labels?: GlobeLabelsConfig;
	rings?: GlobeRingsConfig;
	arcs?: GlobeArcsConfig;
	animation?: GlobeAnimationConfig;
	autoplay?: GlobeAutoPlayConfig;
	html?: GlobeHtmlConfig;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Creates default globe configuration with responsive values
 * Uses mq.sm to determine if we're on a small screen
 */
export function createDefaultConfig(
	width: number = typeof window !== "undefined" ? window.innerWidth : 1920,
	height: number = typeof window !== "undefined" ? window.innerHeight : 1080,
): GlobeConfig {
	// Use mq.sm directly for responsive values (0-639px = small screen)
	const isSmallScreen = mq.sm;

	// Responsive values based on screen size
	const globeWidth = width;
	const globeHeight = height;
	const globeLeft = 0;
	const globeTop = isSmallScreen ? height * 0.9 : height * 1.72;

	// Camera settings
	const povAltitude = isSmallScreen ? 0.8 : 0.2;
	const povLatitude = isSmallScreen ? 36 : 21;

	// Label settings
	const labelSize = isSmallScreen ? 0.75 : 0.25;
	const labelDotRadius = isSmallScreen ? 0.3 : 0.1;
	const labelAltitude = 0.015;

	// Ring settings
	const ringMaxRadius = isSmallScreen ? 4 : 2;
	const ringPropagationSpeed = isSmallScreen ? 4 : 2;
	const ringAltitude = 0.002;

	// Arc settings
	const arcStroke = isSmallScreen ? 0.2 : 0.05;
	const arcAltitude = null;
	const arcAltitudeAutoscale = isSmallScreen ? 0.3 : 0.2;
	const arcStartAltitude = 0.003;
	const arcEndAltitude = 0.003;

	// Atmosphere settings
	const atmosphereAltitude = isSmallScreen ? 0 : 0.15;

	// Polygon settings
	const polygonAltitude = 0.005;

	// HTML marker settings
	const htmlAltitude = 0.02;

	return {
		globe: {
			image: "/images/skins/earth-blue-marble.jpg",
			width: globeWidth,
			height: globeHeight,
			left: globeLeft,
			top: globeTop,
			altitude: povAltitude,
			latitude: povLatitude,
		},
		atmosphere: {
			show: true,
			color: "lightskyblue",
			altitude: atmosphereAltitude,
		},
		vignette: {
			enabled: true,
			fadeStart: 0.3,
			fadeEnd: 1.0,
			opacity: 0.7,
		},
		points: {
			altitude: 0.003,
			color: "rgba(0, 0, 255, 1)",
		},
		labels: {
			size: labelSize,
			dotRadius: labelDotRadius,
			textColor: "rgba(255, 255, 255, 1)",
			dotColor: "#ffffff",
			altitude: labelAltitude,
		},
		rings: {
			color: "#ffffff",
			maxRadius: ringMaxRadius,
			propagationSpeed: ringPropagationSpeed,
			repeatPeriod: 1000,
			altitude: ringAltitude,
		},
		arcs: {
			relativeLength: 0.4,
			flightTime: 2000,
			numRings: 5,
			stroke: arcStroke,
			dashLength: 0.6,
			dashGap: 2,
			dashInitialGap: 1,
			altitude: arcAltitude,
			altitudeAutoscale: arcAltitudeAutoscale,
			startAltitude: arcStartAltitude,
			endAltitude: arcEndAltitude,
			color: "rgba(255, 255, 255, 1)",
		},
		polygon: {
			altitude: polygonAltitude,
		},
		animation: {
			duration: 1000,
		},
		autoplay: {
			enabled: true,
			interval: 7000,
			pauseOnInteraction: true,
			resumeDelay: 60000,
		},
		html: {
			altitude: htmlAltitude,
		},
	};
}

/**
 * Deep merge multiple globe configurations.
 * The last object in the array has the highest precedence.
 */
export function mergeConfigs(
	...configs: (GlobeConfig | undefined)[]
): GlobeConfig {
	const result: GlobeConfig = {};
	for (const config of configs) {
		if (!config) continue;
		result.data = { ...result.data, ...config.data };
		result.globe = { ...result.globe, ...config.globe };
		result.atmosphere = { ...result.atmosphere, ...config.atmosphere };
		result.hexPolygon = { ...result.hexPolygon, ...config.hexPolygon };
		result.polygon = { ...result.polygon, ...config.polygon };
		result.vignette = { ...result.vignette, ...config.vignette };
		result.points = { ...result.points, ...config.points };
		result.labels = { ...result.labels, ...config.labels };
		result.rings = { ...result.rings, ...config.rings };
		result.arcs = { ...result.arcs, ...config.arcs };
		result.animation = { ...result.animation, ...config.animation };
		result.autoplay = { ...result.autoplay, ...config.autoplay };
		result.html = { ...result.html, ...config.html };
	}
	return result;
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
	config: GlobeAutoPlayConfig,
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
		if (!userInteracted && config.enabled) {
			timer = setInterval(advanceCallback, config.interval);
		}
	};

	const pause = () => {
		if (!config.pauseOnInteraction) return;

		userInteracted = true;
		clearTimer();
		clearPauseTimer();

		if (config.resumeDelay && config.resumeDelay > 0) {
			pauseTimer = setTimeout(() => {
				userInteracted = false;
				if (config.enabled && active) {
					startTimer();
				}
			}, config.resumeDelay);
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
				document.visibilityState === "visible" && config.enabled && active
			) {
				startTimer();
			}
		});
	}

	// Return controller function
	return (start = true) => {
		if (!config.enabled) return;

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
