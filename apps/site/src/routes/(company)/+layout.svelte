<script>
	import '../../app.css';
	import { Logo, Toggle, Link, Text, Preview } from '@layerd/ui';

	let { children } = $props();
</script>

<main class="grid min-h-svh w-full grid-cols-[280px_minmax(600px,_1fr)_100px] gap-10">
	<nav class="bg-neutral-200/40 p-4">
		<Logo name="Trident Cubed" />

		<div class="ml-2 mt-8">
			<Toggle
				open
				variant="panel"
				label="Email"
				button={{
					icon: 'icon-[mdi--email-outline] transition-transform duration-200',
					iconHover: 'icon-[mdi--email] transition-transform duration-200',
					iconToggle: 'icon-[mdi--email] transition-transform duration-200',
					variant: 'icon text',
					width: 'full',
					padding: 'none',
					appearance: 'ghost',
					class: '!p-0 !font-bold uppercase',
					size: 'sm'
				}}
			>
				<Toggle
					open
					variant="panel"
					label="Person"
					button={{
						icon: 'icon-[mdi--chevron-right] text-base-400 transition-transform duration-200',
						iconHover: 'icon-[mdi--chevron-right] text-primary-600 duration-200',
						iconToggle:
							'icon-[mdi--chevron-right] text-primary-600 transition-transform duration-200 rotate-90 text-primary',
						variant: 'icon text',
						width: 'full',
						padding: 'none',
						appearance: 'ghost',
						class: '!p-0 !font-bold',
						size: 'sm'
					}}
				>
					<div class="ml-7 pb-2">
						<Link
							href="/hector"
							text="Hector Ramirez"
							class="text-sm"
						/>
						<Link
							href="/hector"
							text="Hector Ramirez"
							class="text-sm"
						/>
						<Link
							href="/hector"
							text="Hector Ramirez"
							class="text-sm"
						/>
					</div>
				</Toggle>

				<Toggle
					variant="panel"
					label="Group"
					button={{
						icon: 'icon-[mdi--chevron-right] text-base-400 transition-transform duration-200',
						iconHover: 'icon-[mdi--chevron-right] text-primary-600 duration-200',
						iconToggle:
							'icon-[mdi--chevron-right] text-primary-600 transition-transform duration-200 rotate-90 text-primary',
						variant: 'icon text',
						width: 'full',
						padding: 'none',
						appearance: 'ghost',
						class: '!p-0 !font-bold',
						size: 'sm'
					}}
				>
					<div class="ml-7 pb-2">
						<Link
							href="/hector"
							text="Hector Ramirez"
							class="text-sm"
						/>
						<Link
							href="/hector"
							text="Hector Ramirez"
							class="text-sm"
						/>
						<Link
							href="/hector"
							text="Hector Ramirez"
							class="text-sm"
						/>
					</div>
				</Toggle>
			</Toggle>
		</div>
	</nav>

	<div class="container py-10">
		{@render children()}
	</div>
</main>
