<script lang="ts">
	/**
	 * @tags slider, carousel, embla
	 * @layout horizontal
	 */
	import { Component, type ComponentProps } from '@layerd/ui';
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import Autoplay from 'embla-carousel-autoplay';
	import AutoScroll from 'embla-carousel-auto-scroll';
	import ClassNames from 'embla-carousel-class-names';
	import type { EmblaOptionsType } from 'embla-carousel';

	export interface SliderProps extends Omit<ComponentProps, 'disabled'> {
		variant?: 'base' | 'autoplay' | 'fade';
		show?: number;
		loop?: boolean;
		autoplay?: boolean;
		autoscroll?: boolean | number;
		duration?: number;
		slides?: any[];
		disabled?: 'sm' | 'md' | 'lg' | 'xl';
		container?: string;
		slide?: string;
	}

	let {
		variant = 'base',
		show = 1,
		loop = false,
		autoplay = false,
		autoscroll = false,
		duration = 5000,
		slides = [],
		disabled,
		container = '',
		slide = '',
		children = undefined,
		...props
	}: SliderProps = $props();

	// Calculate autoscroll values
	const isAutoscroll = $derived(autoscroll !== false && autoscroll !== 0);
	const autoscrollSpeed = $derived(() => {
		if (autoscroll === false || autoscroll === 0) return 0;
		if (autoscroll === true) return 0.25; // Default speed
		return Number(autoscroll); // Custom speed
	});

	// Tailwind breakpoint mapping
	const breakpoints = {
		sm: '640px',
		md: '768px',
		lg: '1024px',
		xl: '1280px'
	};

	// Generate breakpoints config based on disabled prop
	const responsiveBreakpoints = $derived(() => {
		const config: Record<string, any> = {
			'(max-width: 768px)': {
				slidesToScroll: 1,
				align: 'center',
				// Adjust container behavior for mobile peek effect
				containScroll: false
			}
		};

		// Add disabled breakpoint if specified
		if (disabled && breakpoints[disabled]) {
			config[`(min-width: ${breakpoints[disabled]})`] = {
				active: false
			};
		}

		return config;
	});

	// Embla options
	let options: EmblaOptionsType = $derived({
		loop: loop || isAutoscroll, // Auto-enable loop for autoscroll
		align: 'center', // Center the active slide
		slidesToScroll: 1,
		containScroll: isAutoscroll ? false : 'trimSnaps', // Disable containScroll for autoscroll
		watchDrag: !isAutoscroll, // Disable dragging when autoscroll is enabled
		// Use dynamic responsive breakpoints
		breakpoints: responsiveBreakpoints()
	});

	// Embla plugins
	let plugins = $derived(() => {
		const pluginList: any[] = [
			ClassNames({
				snapped: 'active',
				inView: 'inview'
			})
		];

		if (autoplay || variant === 'autoplay') {
			pluginList.push(Autoplay({ delay: duration }));
		}

		if (isAutoscroll) {
			pluginList.push(
				AutoScroll({
					speed: autoscrollSpeed(),
					startDelay: 1000,
					stopOnInteraction: false,
					stopOnMouseEnter: false,
					stopOnFocusIn: false
				})
			);
		}

		return pluginList;
	});

	// Embla configuration
	let emblaConfig = $derived({
		options,
		plugins: plugins()
	});

	// API reference
	let emblaApi: any = $state(null);
	let containerRef: HTMLDivElement | null = $state(null);

	function onInit(event: any) {
		emblaApi = event.detail;

		// After Embla initializes, wrap each child in embla__slide
		if (containerRef) {
			updateSlideClasses();
			wrapChildrenInSlides();
		}
	}

	// Handle window resize to update slide classes
	$effect(() => {
		if (typeof window !== 'undefined') {
			// Initial calculation
			updateSlideClasses();

			const handleResize = () => {
				updateSlideClasses();
				if (containerRef && emblaApi) {
					emblaApi.reInit();
				}
			};

			window.addEventListener('resize', handleResize);
			return () => window.removeEventListener('resize', handleResize);
		}
	});

	// State for responsive slide classes
	let slideClasses = $state('');

	// Calculate slide classes based on screen size and show count
	function updateSlideClasses() {
		if (show === 1) {
			// Single slide mode
			slideClasses = 'w-full max-w-sm mx-auto flex-none';
		} else if (typeof window !== 'undefined' && window.innerWidth < 768) {
			// Mobile: Different behavior based on autoscroll
			if (isAutoscroll) {
				// For autoscroll sliders (like partners), respect the show count
				const mobileWidthClass =
					{
						2: 'w-1/2',
						3: 'w-1/3',
						4: 'w-1/4',
						5: 'w-1/5',
						6: 'w-1/6'
					}[show] || `w-1/${show}`;

				slideClasses = `flex-none ${mobileWidthClass} min-w-0`;
			} else {
				// For regular sliders (testimonials, profiles), use peek effect
				slideClasses = 'flex-none w-[75%] min-w-0';
			}
		} else {
			// Desktop: use predefined widths based on show count
			const widthClass =
				{
					2: 'w-1/2',
					3: 'w-1/3',
					4: 'w-1/4',
					5: 'w-1/5',
					6: 'w-1/6'
				}[show] || `w-1/${show}`;

			slideClasses = `flex-none ${widthClass} min-w-0`;
		}
	}

	function wrapChildrenInSlides() {
		if (!containerRef) return;

		// Get all direct children of the container
		const children = Array.from(containerRef.children);

		// Wrap each child that doesn't already have embla__slide class
		children.forEach((child) => {
			if (!child.classList.contains('embla__slide')) {
				// Create slide wrapper
				const slideWrapper = document.createElement('div');
				slideWrapper.className = `embla__slide ${slideClasses} ${slide}`.trim();

				// Insert wrapper before child and move child into wrapper
				containerRef!.insertBefore(slideWrapper, child);
				slideWrapper.appendChild(child);
			}
		});

		// Update classes on existing slides
		const slides = containerRef.querySelectorAll('.embla__slide');
		slides.forEach((slideElement: Element) => {
			slideElement.className = `embla__slide ${slideClasses} ${slide}`.trim();
		});

		// Reinitialize Embla to recognize the new slide structure
		if (emblaApi) {
			emblaApi.reInit();
		}
	}
</script>

<!-- ⬜ default ⬛ prop 🟪 snippet 🟦 children -->

<!-- Template 
::::::::::::::::::::::::::::::::::::::::::::: -->
<Component
	{...props}
	class="slider embla select-none overflow-hidden {isAutoscroll ? '' : 'cursor-grab'} {props.class}"
>
	{#snippet component({ props })}
		<div
			{...props}
			use:emblaCarouselSvelte={emblaConfig}
			onemblaInit={onInit}
		>
			<div
				class="slider-container embla__container flex {container}"
				bind:this={containerRef}
			>
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	{/snippet}
</Component>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	:global(.embla__slide) {
		/* Ensure slides maintain proper flex behavior */
		flex-shrink: 0;
		/* Allow slides to maintain consistent width across all viewports */
		min-width: 0;
		/* Ensure proper centering of content */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.embla__slide > *) {
		/* Ensure child content fills the slide properly */
		width: 100%;
		max-width: 100%;
	}
</style>
