<script lang="ts">
	/**
	 * @tags forms, input, textfield, icon, label
	 * @layout horizontal
	 */
	import { Component, type ComponentProps, Text, Icon } from '@layerd/ui';
	import { TextareaAutosize } from 'runed';

	export interface InputProps extends ComponentProps {
		// Input properties
		type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';
		value?: string;
		placeholder?: string;
		label?: string;
		name?: string;
		id?: string;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		pattern?: string;
		textarea?: boolean;
		autocomplete?:
			| 'on'
			| 'off'
			| 'email'
			| 'username'
			| 'current-password'
			| 'new-password'
			| 'name'
			| 'tel'
			| 'url'
			| AutoFill;
		autocorrect?: 'on' | 'off';
		autocapitalize?: 'on' | 'off' | 'words' | 'characters';
		spellcheck?: boolean;

		// Icon properties - HYBRID APPROACH (handled by Icon component)
		/**
		 * Icon configuration - supports multiple formats:
		 * - String: "person" or "icon-[mdi--person]"
		 * - Object: { name: "person", theme: "mdi", class: "custom" }
		 */
		icon?:
			| string
			| {
					name?: string;
					theme?: 'mdi' | 'heroicons' | 'carbon' | 'solar' | string;
					class?: string;
			  };

		// Variants
		variant?: 'label' | 'icon' | 'icon label' | 'label icon' | 'icon label icon';
	}

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = ' ', // Add space to make :placeholder-shown work
		label = 'Input Label',
		name = undefined,
		id = undefined,
		required = false,
		disabled = false,
		readonly = false,
		pattern = undefined,
		textarea = false,
		spellcheck = false,
		icon = undefined,
		variant = 'label',
		children = undefined,
		...props
	}: InputProps = $props();

	// Generate unique id if not provided
	const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

	// Textarea autosize setup
	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	// Initialize TextareaAutosize when textarea is enabled
	$effect(() => {
		if (textarea && textareaEl) {
			new TextareaAutosize({
				element: () => textareaEl || undefined,
				input: () => value
			});
		}
	});
</script>

<!-- ⬜ default ⬛ prop 🟪 snippet 🟦 children -->

<!-- Snippets 
::::::::::::::::::::::::::::::::::::::::::::: -->

<!-- Leading Icon -->
{#snippet leadingIcon()}
	{#if icon}
		<Icon
			{icon}
			class="input-icon"
		/>
	{/if}
{/snippet}

<!-- Trailing Icon -->
{#snippet trailingIcon()}
	{#if icon}
		<Icon
			{icon}
			class="input-trailing-icon"
		/>
	{/if}
{/snippet}

<!-- Variants 
::::::::::::::::::::::::::::::::::::::::::::: -->

<!-- Icon -->
{#snippet iconVariant()}
	{@render leadingIcon()}
	{@render inputElement('input-with-icon')}
{/snippet}

<!-- Label -->
{#snippet labelVariant()}
	{@render inputElement('input-with-label')}
{/snippet}

<!-- Icon Label -->
{#snippet iconLabelVariant()}
	{@render leadingIcon()}
	{@render inputElement('input-with-icon-label')}
{/snippet}

<!-- Label Icon -->
{#snippet labelIconVariant()}
	{@render inputElement('input-with-label-icon')}
	{@render trailingIcon()}
{/snippet}

<!-- Icon Label Icon -->
{#snippet iconLabelIconVariant()}
	{@render leadingIcon()}
	{@render inputElement('input-with-icon-label-icon')}
	{@render trailingIcon()}
{/snippet}

<!-- Input Element -->
{#snippet inputElement(className: string)}
	{#if textarea}
		<textarea
			bind:this={textareaEl}
			bind:value
			{placeholder}
			{name}
			id={inputId}
			{required}
			{disabled}
			{readonly}
			autocomplete="off"
			autocapitalize="off"
			{spellcheck}
			class="
				-mt-1.25 mb-1.25
				block min-h-32
				w-full resize-none
				border-0
				bg-transparent
				px-4
				py-2
				pl-5
				outline-none
			"
		></textarea>
	{:else}
		<input
			{type}
			bind:value
			{placeholder}
			{name}
			id={inputId}
			{required}
			{disabled}
			{readonly}
			{pattern}
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			{spellcheck}
			class="
				-mt-1.25 mb-1.25
				block
				w-full
				border-0 bg-transparent px-4
				py-2
				pl-5
				outline-none
			"
		/>
	{/if}
{/snippet}

<!-- Template 
::::::::::::::::::::::::::::::::::::::::::::: -->
<Component
	{...props}
	class="input-wrapper {props.class}"
>
	{#snippet component({ props })}
		<fieldset
			{...props}
			class="
					border-base-300-700
					bg-base-300-700
					shadow-base-100-700
					group relative min-w-72
					rounded-xl
					border-2
					shadow-[inset_0_0_0_999rem]
			"
		>
			<legend
				class="
					px-1.25
					text-base-300-600/80
					pointer-events-none
					mx-4
					origin-top-left
					translate-y-[125%]
					font-medium
					leading-[1.25rem]

					transition-all
					duration-200
					will-change-[color,transform,font-size]
				"
			>
				{label}
			</legend>
			{#if variant === 'icon'}
				{@render iconVariant()}
			{:else if variant === 'icon label'}
				{@render iconLabelVariant()}
			{:else if variant === 'label icon'}
				{@render labelIconVariant()}
			{:else if variant === 'icon label icon'}
				{@render iconLabelIconVariant()}
			{:else}
				{@render labelVariant()}
			{/if}
		</fieldset>
	{/snippet}
</Component>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	fieldset {
		@variant focus-within {
			@apply border-primary bg-transparent shadow-none;

			@variant has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
				@apply border-primary bg-transparent shadow-none;
			}
		}

		@variant has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
			@apply border-base-600-50 bg-transparent shadow-none;
		}

		legend {
			@variant group-focus-within {
				@apply text-primary-500 translate-y-0 text-xs;

				@variant group-has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
					@apply text-primary-500 translate-y-0 text-xs;
				}
			}

			@variant group-has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
				@apply text-primary-600 translate-y-0 text-xs;
			}
		}
	}
</style>
