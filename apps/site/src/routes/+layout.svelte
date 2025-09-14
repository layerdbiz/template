<script>
	import '../app.css';
	import {
		Metadata,
		Theme,
		Header,
		Footer,
		Container,
		Nav,
		Button,
		Logo,
		Toggle,
		Link,
		Image,
		scroll,
		mq
	} from '@layerd/ui';
	let { children } = $props();
	let navOpen = $state(false);

	let headerElement = $state();

	// Navigation links configuration
	const links = [
		{ href: '#Home', label: 'Home' },
		{ href: '#About', label: 'About' },
		{
			href: '#Services',
			label: 'Services',
			type: 'dropdown',
			children: [
				{ href: '#Earth', label: 'Earth' },
				{ href: '#Wind', label: 'Wind' },
				{ href: '#Fire', label: 'Fire' },
				{ href: '#Water', label: 'Water' }
			]
		},
		{ href: '#Contact', label: 'Contact' },
		{ href: '#FAQ', label: 'FAQ' }
	];
</script>

<!-- <Metadata /> -->
<Header
	fixed
	appearance={navOpen ? 'glass' : scroll.top ? 'ghost' : 'glass'}
	invert
	class="rounded-4xl relative grid grid-cols-[auto_minmax(0,1fr)] grid-rows-1 gap-4 p-2 lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-1 {navOpen
		? 'grid-rows-[auto_auto]'
		: ''}"
>
	<Logo
		name="Trident Cubed"
		class="size-11 shrink-0 items-start lg:col-start-1 lg:row-start-1"
	/>
	<Nav bind:navOpen>
		<!--     
		{#each links as link}
			{#if link.type === 'dropdown'}
				<Toggle
					align="bottom"
					type={mq.md ? 'menu' : 'panel'}
					trigger={mq.md ? 'hover' : 'click'}
					class="link flex items-center"
					triggerClass=""
					contentClass="!pt-4"
					href={link.href}
					navId={link.href.slice(1)}
					icon="chevron-right"
					label={link.label}
					unstyled
				>
					<div
						class="grid items-center gap-2 p-4 md:rounded-2xl md:bg-white md:text-black md:ring-2 md:ring-black"
					>
						{#each link.children as childLink}
							<Link href={childLink.href}>{childLink.label}</Link>
						{/each}
					</div>
				</Toggle>
			{:else}
				<Link href={link.href}>{link.label}</Link>
			{/if}
		{/each} -->
		{#each links as link}
			<Link href={link.href}>{link.label}</Link>
		{/each}

		<Theme
			ghost
			invert
			class="justify-self-start lg:justify-self-center"
		/>
		<Button
			size={mq.md ? 'sm' : 'lg'}
			primary
			icon="person"
			label="Sign In"
			class="w-full lg:w-14"
		/>
	</Nav>
</Header>

<main class="container flex flex-col">
	{@render children()}
</main>
<Footer
	class="relative py-10"
	invert
>
	<Container>hi mom footer</Container>
	<!-- blue radial gradient -->
	<Image
		bg
		class="mask-t-from-0% mask-t-to-100% absolute bottom-0 size-full overflow-hidden"
		overlay="bg-radial from-primary to-transparent from-0% to-100% bg-black scale-y-200 origin-bottom translate-y-3/4 "
	/>
</Footer>

<style lang="postcss">
	@reference '@layerd/ui/ui.css';

	:global {
		.nav .link:not(.logo),
		.nav .link.toggle:not(.link.toggle-trigger) {
			@apply md:!flex md:h-[calc(100%+1rem)];
		}
	}
</style>
