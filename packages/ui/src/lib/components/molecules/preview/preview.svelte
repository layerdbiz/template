<script lang="ts">
	/**
	 * @tags ui
	 * @layout horizontal
	 */
	import { Component, type ComponentProps, Toggle } from '@layerd/ui';

	export interface PreviewProps extends ComponentProps {
		text?: string;
		variant?: 'base' | 'variant1' | 'variant2';
	}

	let {
		text = undefined,
		variant = 'base',
		children = undefined,
		...props
	}: PreviewProps = $props();
</script>

<!-- Template 
::::::::::::::::::::::::::::::::::::::::::::: -->
<Component
	{...props}
	class="preview {props.class}"
>
	{#snippet component({ props: componentProps })}
		<div {...componentProps}>
			<Toggle
				label="Preview"
				animation="fade"
				button={{
					variant: 'text',
					class: '!font-black hover:[&_.btn-icon]:text-primary bg-white text-black w-min'
				}}
			>
				<div class="bg-white">
					{@render children()}
				</div>
			</Toggle>
			<Toggle
				label="Preview"
				animation="fade"
				button={{
					variant: 'text',
					class: '!font-black hover:[&_.btn-icon]:text-primary bg-white text-black w-min'
				}}
			>
				<div class="bg-white">hi mom</div>
			</Toggle>
		</div>
	{/snippet}
</Component>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	.preview {
		@apply border-neutral-200-600 rounded-lg border bg-lime-400 bg-white p-6;

		background-image: repeating-linear-gradient(
			45deg,
			var(--color-neutral-100-900),
			var(--color-neutral-100-900) 13px,
			var(--color-neutral-200-700) 13px,
			var(--color-neutral-200-700) 14px
		);

		background-size: 40px 40px;
	}
</style>
