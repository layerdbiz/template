<script lang="ts">
	/**
	 * @tags text, typography, heading, paragraph
	 */
	import { Component, type ComponentProps, type ComponentReturn } from '@layerd/ui';

	export interface TextProps extends ComponentProps {
		// Core text properties
		type?:
			| 'h1'
			| 'h2'
			| 'h3'
			| 'h4'
			| 'h5'
			| 'h6'
			| 'p'
			| 'bold'
			| 'italic'
			| 'line'
			| 'underline'
			| 'quote'
			| 'key'
			| 'small'
			| 'code'
			| 'codeblock';
		text?: string;

		// Typewriter effect
		typewriter?: {
			start?: string;
			messages: string[];
			autoplay?: boolean;
			loop?: boolean;
			speed?: number;
			delay?: number;
			delete?: boolean;
		};

		// Prose control
		prose?: boolean;
		noprose?: boolean;
		disabled?: boolean;

		// Prose size variants
		xs?: boolean;
		sm?: boolean;
		md?: boolean;
		lg?: boolean;
		xl?: boolean;

		// Boolean shortcuts for text types (legacy support)
		h1?: boolean | string;
		h2?: boolean | string;
		h3?: boolean | string;
		h4?: boolean | string;
		h5?: boolean | string;
		h6?: boolean | string;
		p?: boolean | string;

		// New text format props
		bold?: boolean | string;
		italic?: boolean | string;
		line?: boolean | string;
		underline?: boolean | string;
		quote?: boolean | string;
		key?: boolean | string;
		small?: boolean | string;
		code?: boolean | string;
		codeblock?: boolean | string;

		// Content children
		children?: any;
	}

	let {
		type = 'p',
		text = 'Sample Text',
		typewriter,
		prose = true,
		disabled = false,
		noprose = false,
		xs = false,
		sm = false,
		md = false,
		lg = false,
		xl = false,
		h1 = false,
		h2 = false,
		h3 = false,
		h4 = false,
		h5 = false,
		h6 = false,
		p = false,
		bold = false,
		italic = false,
		line = false,
		underline = false,
		quote = false,
		key = false,
		small = false,
		code = false,
		codeblock = false,
		children,
		...props
	}: TextProps = $props();

	// Determine final type and content based on props
	const getTypeAndContent = $derived(() => {
		// Check string props first (highest priority)
		if (typeof h1 === 'string') return { type: 'h1', content: h1 };
		if (typeof h2 === 'string') return { type: 'h2', content: h2 };
		if (typeof h3 === 'string') return { type: 'h3', content: h3 };
		if (typeof h4 === 'string') return { type: 'h4', content: h4 };
		if (typeof h5 === 'string') return { type: 'h5', content: h5 };
		if (typeof h6 === 'string') return { type: 'h6', content: h6 };
		if (typeof p === 'string') return { type: 'p', content: p };
		if (typeof bold === 'string') return { type: 'bold', content: bold };
		if (typeof italic === 'string') return { type: 'italic', content: italic };
		if (typeof line === 'string') return { type: 'line', content: line };
		if (typeof underline === 'string') return { type: 'underline', content: underline };
		if (typeof quote === 'string') return { type: 'quote', content: quote };
		if (typeof key === 'string') return { type: 'key', content: key };
		if (typeof small === 'string') return { type: 'small', content: small };
		if (typeof code === 'string') return { type: 'code', content: code };
		if (typeof codeblock === 'string') return { type: 'codeblock', content: codeblock };

		// Check boolean props (medium priority)
		if (h1 === true) return { type: 'h1', content: text };
		if (h2 === true) return { type: 'h2', content: text };
		if (h3 === true) return { type: 'h3', content: text };
		if (h4 === true) return { type: 'h4', content: text };
		if (h5 === true) return { type: 'h5', content: text };
		if (h6 === true) return { type: 'h6', content: text };
		if (p === true) return { type: 'p', content: text };
		if (bold === true) return { type: 'bold', content: text };
		if (italic === true) return { type: 'italic', content: text };
		if (line === true) return { type: 'line', content: text };
		if (underline === true) return { type: 'underline', content: text };
		if (quote === true) return { type: 'quote', content: text };
		if (key === true) return { type: 'key', content: text };
		if (small === true) return { type: 'small', content: text };
		if (code === true) return { type: 'code', content: text };
		if (codeblock === true) return { type: 'codeblock', content: text };

		// Default to type prop (lowest priority)
		return { type, content: text };
	});

	const finalType = $derived(getTypeAndContent().type);
	const finalContent = $derived(getTypeAndContent().content);

	// Build prose classes
	const proseClasses = $derived.by(() => {
		// If prose is explicitly disabled or noprose is true, return empty
		if (prose === false || noprose === true || disabled === true) return '';

		// Build the prose class with size variant
		let classes = 'prose';

		if (xs) classes += ' prose-xs';
		else if (sm) classes += ' prose-sm';
		else if (md) classes += ' prose-md';
		else if (lg) classes += ' prose-lg';
		else if (xl) classes += ' prose-xl';

		return classes;
	});

	// Typewriter effect logic
	let typewriterEl = $state<HTMLElement | null>(null);
	let display = $state('');
	let running = $state(false);
	let cancel = false;
	let initialized = false;

	const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

	const typeText = async (msg: string) => {
		display = '';
		if (typewriterEl) typewriterEl.textContent = '';
		for (const ch of msg) {
			if (cancel) return;
			display += ch;
			if (typewriterEl) typewriterEl.textContent = display;
			await sleep(typewriter?.speed ?? 50);
		}
	};

	const deleteText = async () => {
		// Check if delete animation is enabled (defaults to true)
		const shouldAnimate = typewriter?.delete ?? true;

		if (shouldAnimate) {
			// Animated deletion: character by character
			while (display.length > 0 && !cancel) {
				display = display.slice(0, -1);
				if (typewriterEl) typewriterEl.textContent = display;
				await sleep(typewriter?.speed ?? 50);
			}
		} else {
			// Instant deletion: remove all at once
			display = '';
			if (typewriterEl) typewriterEl.textContent = '';
		}
	};

	const cycleMessages = async () => {
		if (running || !typewriter?.messages?.length) return;
		running = true;

		// Delete start text first if it exists
		if (typewriter.start && display.length > 0 && !cancel) {
			// Add a delay before starting to delete the start text
			await sleep(typewriter?.delay ?? 3000);
			await deleteText();
		}

		// Then cycle through messages
		do {
			for (const msg of typewriter.messages) {
				if (cancel) break;
				await typeText(msg);
				await sleep(typewriter?.delay ?? 3000);
				await deleteText();
			}
		} while ((typewriter?.loop ?? true) && !cancel);
		running = false;
	};

	$effect(() => {
		if (!typewriter) {
			cancel = true;
			display = '';
			if (typewriterEl) typewriterEl.textContent = '';
			initialized = false;
			return;
		}

		// Only initialize once
		if (initialized) return;

		// Wait for element to be bound before initializing
		if (!typewriterEl) return;

		cancel = false;
		initialized = true;

		const startText = typewriter.start ?? '';
		display = startText;
		typewriterEl.textContent = startText;

		if (typewriter.autoplay ?? true) cycleMessages();

		return () => {
			cancel = true;
			initialized = false;
		};
	});
</script>

<Component
	{...props}
	class="text {proseClasses} {props.class}"
	{children}
>
	{#snippet typewriterContent()}
		<span
			class="sr-only !absolute !m-0 !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0"
			>{finalContent}</span
		>
		<span
			bind:this={typewriterEl}
			class="typewriter-text"
			aria-live="polite"
			aria-atomic="true"
		></span>
	{/snippet}

	{#snippet component({
		props: componentProps,
		content
	}: {
		props: ComponentReturn;
		content: import('svelte').Snippet<[string?]>;
	})}
		{#if typewriter}
			{#if finalType === 'h1'}
				<h1 {...componentProps}>{@render typewriterContent()}</h1>
			{:else if finalType === 'h2'}
				<h2 {...componentProps}>{@render typewriterContent()}</h2>
			{:else if finalType === 'h3'}
				<h3 {...componentProps}>{@render typewriterContent()}</h3>
			{:else if finalType === 'h4'}
				<h4 {...componentProps}>{@render typewriterContent()}</h4>
			{:else if finalType === 'h5'}
				<h5 {...componentProps}>{@render typewriterContent()}</h5>
			{:else if finalType === 'h6'}
				<h6 {...componentProps}>{@render typewriterContent()}</h6>
			{:else}
				<p {...componentProps}>{@render typewriterContent()}</p>
			{/if}
		{:else if finalType === 'h1'}
			<h1 {...componentProps}>{@render content(finalContent)}</h1>
		{:else if finalType === 'h2'}
			<h2 {...componentProps}>{@render content(finalContent)}</h2>
		{:else if finalType === 'h3'}
			<h3 {...componentProps}>{@render content(finalContent)}</h3>
		{:else if finalType === 'h4'}
			<h4 {...componentProps}>{@render content(finalContent)}</h4>
		{:else if finalType === 'h5'}
			<h5 {...componentProps}>{@render content(finalContent)}</h5>
		{:else if finalType === 'h6'}
			<h6 {...componentProps}>{@render content(finalContent)}</h6>
		{:else if finalType === 'bold'}
			<strong {...componentProps}>{@render content(finalContent)}</strong>
		{:else if finalType === 'italic'}
			<em {...componentProps}>{@render content(finalContent)}</em>
		{:else if finalType === 'line'}
			<s {...componentProps}>{@render content(finalContent)}</s>
		{:else if finalType === 'underline'}
			<u {...componentProps}>{@render content(finalContent)}</u>
		{:else if finalType === 'quote'}
			<blockquote {...componentProps}>{@render content(finalContent)}</blockquote>
		{:else if finalType === 'key'}
			<kbd {...componentProps}>{@render content(finalContent)}</kbd>
		{:else if finalType === 'small'}
			<small {...componentProps}>{@render content(finalContent)}</small>
		{:else if finalType === 'code'}
			<code {...componentProps}>{@render content(finalContent)}</code>
		{:else if finalType === 'codeblock'}
			<pre {...componentProps}><code>{@render content(finalContent)}</code></pre>
		{:else}
			<p {...componentProps}>{@render content(finalContent)}</p>
		{/if}
	{/snippet}
</Component>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	.text {
		@apply block;
	}

	.typewriter-text {
		/* Prevent layout shift when empty by maintaining minimum height */
		display: inline-block;
		min-height: 1em;

		/* Add a blinking cursor effect only when there's content */
		&:not(:empty)::after {
			content: '|';
			opacity: 0;
		}
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
