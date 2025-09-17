<script lang="ts">
	/**
	 * @tags icon, iconify, theme
	 * @type multi
	 * @layout horizontal
	 */
	export interface IconProps {
		/**
		 * Icon identifier - supports multiple formats:
		 * - String: "person" or "icon-[mdi--person]" or "mdi--person"
		 * - Object: { name: "person", theme: "mdi", class: "custom" }
		 */
		icon?:
			| string
			| {
					name?: string;
					theme?: 'mdi' | 'heroicons' | 'carbon' | 'solar' | string;
					class?: string;
			  };
		/** Legacy name prop for backward compatibility */
		name?:
			| 'home'
			| 'user'
			| 'settings'
			| 'menu'
			| 'close'
			| 'search'
			| 'edit'
			| 'delete'
			| 'add'
			| 'check'
			| 'arrow-right'
			| 'arrow-left'
			| 'arrow-up'
			| 'arrow-down'
			| 'chevron-right'
			| 'chevron-left'
			| 'chevron-up'
			| 'chevron-down'
			| string;
		/** Override the global icon theme for this specific icon */
		theme?: 'mdi' | 'heroicons' | 'carbon' | 'solar' | string;
		/** Show all available icons */
		all?: boolean;
		/** Show remote icons (requires icons prop to be provided) */
		remote?: boolean;
		/** Array of icon names to display when all=true or remote=true */
		icons?: string[];
		class?: string;
		role?: string;
		'aria-hidden'?: boolean | 'true' | 'false';
		'aria-label'?: string;
	}

	let {
		icon,
		name = '',
		theme,
		all = false,
		remote = false,
		icons = [],
		class: className = '',
		role = 'img',
		'aria-hidden': ariaHidden = true,
		'aria-label': ariaLabel,
		...props
	}: IconProps = $props();

	// Process hybrid icon prop to extract name, theme, and additional classes
	const processedIcon = $derived(() => {
		// Check if className contains "icon-[theme--name]" pattern first
		const iconPattern = /^icon-\[([^-]+)--([^\]]+)\]$/;
		const classMatch = className && className.match(iconPattern);

		if (classMatch) {
			// Use className as raw class when it matches the pattern
			return {
				name: '',
				theme: '',
				class: className,
				useRawClass: true
			};
		}

		// Handle object format: { name: "person", theme: "mdi", class: "custom" }
		if (icon && typeof icon === 'object') {
			return {
				name: icon.name || '',
				theme: icon.theme || theme,
				class: icon.class || '',
				useRawClass: false
			};
		}

		// Handle string format: "icon-[theme--name]" or "person"
		if (icon && typeof icon === 'string') {
			// Check for "icon-[theme--name]" pattern - use as raw class
			const match = icon.match(iconPattern);

			if (match) {
				// Use the full string as-is for the class
				return {
					name: '',
					theme: '',
					class: icon,
					useRawClass: true
				};
			}

			// Check for "theme--name" pattern in icon prop and convert to dynamic selector
			const themeNamePattern = /^([^-]+)--([^-]+)$/;
			const iconThemeNameMatch = icon.match(themeNamePattern);
			if (iconThemeNameMatch) {
				// Convert "devicon--linkedin" to "icon-[devicon--linkedin]"
				return {
					name: '',
					theme: '',
					class: `icon-[${icon}]`,
					useRawClass: true
				};
			}

			// Plain string like "person"
			return {
				name: icon,
				theme: theme,
				class: '',
				useRawClass: false
			};
		}

		// Fallback to legacy name prop
		return {
			name: name,
			theme: theme,
			class: '',
			useRawClass: false
		};
	});

	// Final computed values
	const finalName = $derived(processedIcon().useRawClass ? '' : processedIcon().name);
	const finalTheme = $derived(processedIcon().useRawClass ? '' : processedIcon().theme);
	const finalClass = $derived(processedIcon().class);
	const useRawClass = $derived(processedIcon().useRawClass);

	// Fallback icons only for 'all' mode, not for 'remote' mode
	const fallbackIcons = [
		'home',
		'user',
		'settings',
		'menu',
		'close',
		'search',
		'edit',
		'delete',
		'add',
		'check',
		'arrow-right',
		'arrow-left',
		'arrow-up',
		'arrow-down',
		'chevron-right',
		'chevron-left',
		'chevron-up',
		'chevron-down'
	];

	// For 'all' mode: use provided icons or fallback
	// For 'remote' mode: only use provided icons (no fallback to prevent FOUC)
	const iconsToDisplay = remote ? icons : icons.length > 0 ? icons : fallbackIcons;
</script>

{#if all}
	<div class="flex flex-wrap items-start gap-4">
		{#each iconsToDisplay as iconName}
			<i
				class="icon icon-{iconName}"
				data-icon-theme={theme}
				role="img"
				aria-hidden="true"
				title={iconName}
			></i>
		{/each}
	</div>
{:else}
	<i
		class="{useRawClass
			? finalClass
			: `icon ${finalName ? `icon-${finalName}` : ''} ${finalClass}`} {useRawClass &&
		finalClass === className
			? ''
			: className}"
		data-icon-theme={useRawClass ? undefined : finalTheme}
		{role}
		aria-hidden={ariaHidden}
		aria-label={ariaLabel}
		{...props}
	></i>
{/if}
