<script lang="ts">
	/**
	 * @tags card, content, layout
	 */
	import {
		Component,
		Image,
		Text,
		Icon,
		Button,
		Content,
		type ComponentProps,
		type ImageProps
	} from '@layerd/ui';

	export interface CardProps extends ComponentProps {
		variant?: 'service' | 'profile' | 'testimonial';

		// Generic props that work across variants
		title?: string;
		subtitle?: string;
		description?: string;
		label?: string;
		image?: string | Partial<ImageProps>;
		icon?: string;

		children?: any;
	}

	let {
		variant = 'service',
		title = 'Headline',
		subtitle = 'Subtitle',
		description = 'Please add your content here. Keep it short and simple. ',
		label = 'label',
		image = undefined,
		icon = undefined,
		children = undefined,
		...props
	}: CardProps = $props();

	// Computed mask style with dynamic URL
	let maskStyle = $derived(
		image
			? `mask: url(${image}); -webkit-mask: url(${image}); mask-size: contain; -webkit-mask-size: contain;`
			: ''
	);
</script>

<!-- ⬜ default ⬛ prop 🟪 snippet 🟦 children -->

<!-- Variants 
::::::::::::::::::::::::::::::::::::::::::::: -->
<!-- Service -->
{#snippet service()}
	<!-- Header section with label -->
	<div class="service card-service min-h-35 relative overflow-hidden px-4 py-3">
		<Image bg />
		<Image
			bg
			overlay="bg-gradient-to-t from-primary to-transparent from-0% to-30%"
		/>
		<Text
			noprose
			p={label}
			class="card-label absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-sm text-white"
		/>
	</div>

	<!-- Content section -->
	<div class="card-content space-y-2 p-4">
		<Text
			class="card-title text-base-950-50 text-balance text-lg font-semibold"
			h3={title}
		/>
		<Text
			class="card-description text-base-600-300 text-balance text-sm leading-relaxed"
			p={description}
		/>

		{#if children}
			{@render children()}
		{/if}
	</div>
{/snippet}

<!-- Profile -->
{#snippet profile()}
	<div
		class="image relative flex flex-col items-center justify-end rounded-lg pb-2 md:pb-6 lg:pb-4"
		style="aspect-ratio: 1 / 1;"
	>
		<figure class="-z-1 reflect absolute bottom-0">
			<img
				class="w-full"
				src={image}
				alt={title}
			/>

			<div
				class="bg-linear-to-b pointer-events-none absolute inset-0 from-transparent from-60% to-black to-100%"
				style={maskStyle}
			></div>
		</figure>

		<i class="icon-[devicon--linkedin] text-md mb-1 sm:text-xl lg:text-2xl"></i>

		{#if icon}
			<Button
				variant="icon"
				class=""
			/>
		{/if}

		<Text
			h4={title}
			class="text-light-light text-[x-small] sm:text-xl md:text-xl lg:text-xl"
		/>

		{#if subtitle}
			<Text
				class="text-base-300 text-[x-small] sm:text-sm md:text-sm lg:text-sm"
				p={subtitle}
			/>
		{/if}
	</div>
{/snippet}

<!-- Testimonial -->
{#snippet testimonial()}
	<!-- Quote content -->
	{#if description}
		<blockquote
			class="relative mb-6 inline-block text-balance font-serif text-xl leading-[1.2] lg:text-4xl"
		>
			{description}

			<b
				class="border-primary absolute -left-6 bottom-0 top-0 inline-block border-l-4 lg:-left-12 lg:bottom-2 lg:top-2"
			></b>
		</blockquote>
	{/if}

	<!-- Attribution section -->
	<div class="pt-4">
		{#if title}
			<p class="text-base-950-50 text-sm font-medium uppercase lg:text-lg">{title}</p>
		{/if}

		{#if subtitle}
			<p class="text-primary-500 text-sm uppercase lg:text-lg">{subtitle}</p>
		{/if}
	</div>

	{#if children}
		{@render children()}
	{/if}
{/snippet}

<!-- Template 
::::::::::::::::::::::::::::::::::::::::::::: -->
<Component
	{...props}
	class="card block rounded-xl {props.class}"
>
	{#snippet component({ props })}
		<div {...props}>
			{#if children && !variant}
				{@render children()}
			{:else if variant === 'profile'}
				{@render profile()}
			{:else if variant === 'testimonial'}
				{@render testimonial()}
			{:else}
				{@render service()}
			{/if}
		</div>
	{/snippet}
</Component>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";
</style>
