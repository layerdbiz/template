<script>
	import '../../app.css';
	import { Logo, Toggle, Text, Preview } from '@layerd/ui';

	let { children } = $props();
</script>

<!-- <main class="grid min-h-svh grid-cols-[280px_minmax(900px,_1fr)_100px] gap-10">
	<nav class="bg-neutral-200 p-4">
		<Logo name="Trident Cubed" />

		<div>
			<Text
				h3="Email"
				class="mb-2 mt-4"
			/>
			<Toggle
				variant="panel"
				label="Person"
				class="border-base-300-700 border-b last:border-0"
				button={{
					icon: 'icon-[mdi--chevron-right] transition-transform duration-200 rotate-0',
					iconToggle:
						'icon-[mdi--chevron-right] text-primary transition-transform duration-200 rotate-90',
					variant: 'icon text',
					width: 'full',
					padding: 'none',
					appearance: 'ghost',
					class: '!font-black hover:[&_.btn-icon]:text-primary'
				}}
			>
				<p>test</p>
			</Toggle>
		</div>
	</nav>

	<div>
		{@render children()}
	</div>
</main> -->

<main class="container">
	<Text
		h1="Email Signatures"
		class="mb-6 mt-10"
	/>
	{@render children()}
</main>
