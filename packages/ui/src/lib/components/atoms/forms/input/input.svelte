<script lang="ts">
	/**
	 * @tags forms, input, textfield, icon, label
	 * @layout horizontal
	 */
	import { Component, type ComponentProps, type ComponentReturn, Text, Icon } from '@layerd/ui';
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
			class="input-icon input-icon--leading top-0.75 absolute left-4 text-2xl"
		/>
	{/if}
{/snippet}

<!-- Trailing Icon -->
{#snippet trailingIcon()}
	{#if icon}
		<Icon
			{icon}
			class="input-icon input-icon--trailing top-0.75 absolute right-4 text-2xl"
		/>
	{/if}
{/snippet}

<!-- Variants 
::::::::::::::::::::::::::::::::::::::::::::: -->

<!-- Icon -->
{#snippet iconVariant()}
	{@render leadingIcon()}
	{@render inputElement('pl-12')}
{/snippet}

<!-- Label -->
{#snippet labelVariant()}
	{@render inputElement('pl-5')}
{/snippet}

<!-- Icon Label -->
{#snippet iconLabelVariant()}
	{@render leadingIcon()}
	{@render inputElement('pl-12')}
{/snippet}

<!-- Label Icon -->
{#snippet labelIconVariant()}
	{@render inputElement('pl-5 pr-12')}
	{@render trailingIcon()}
{/snippet}

<!-- Icon Label Icon -->
{#snippet iconLabelIconVariant()}
	{@render leadingIcon()}
	{@render inputElement('pl-12 pr-12')}
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
				text-base-900-50
				block min-h-32
				w-full
				resize-none
				border-0
				bg-transparent
				px-4
				py-2
				outline-none
				{className}
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
				text-base-900-50
				block
				w-full border-0 bg-transparent
				px-4
				py-2
				outline-none
				{className}
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
	{#snippet component({ props }: { props: ComponentReturn })}
		<fieldset
			{...props}
			class="
					border-base-200-700
					text-base-300-700
					bg-base-200-700
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
					text-base-300-600
					pointer-events-none
					mx-3
					origin-top-left
					translate-x-8
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
		/* icon, border: focused + value */
		@variant focus-within {
			@apply border-primary text-primary bg-transparent opacity-100 shadow-none;

			/* icon, border: focused + value */
			@variant has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
				@apply border-primary text-primary bg-transparent opacity-100 shadow-none;
			}
		}

		/* icon, border: unfocused + value */
		@variant has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
			@apply text-primary-700 border-primary-700 bg-transparent shadow-none;
		}

		legend {
			@variant group-focus-within {
				/* label: focused */
				@apply text-primary translate-x-0 translate-y-0 text-xs;

				/* label: focused */
				@variant group-has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
					@apply text-primary translate-x-0 translate-y-0 text-xs;
				}
			}

			/* label: unfocused + value */
			@variant group-has-[input:not(:placeholder-shown),textarea:not(:placeholder-shown)] {
				@apply text-primary-500 translate-x-0 translate-y-0 text-xs;
			}
		}
	}
</style>
