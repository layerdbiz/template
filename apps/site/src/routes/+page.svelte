<script lang="ts">
	import {
		Button,
		mq,
		Icon,
		Divider,
		Content,
		Section,
		Container,
		Card,
		Image,
		Title,
		Text,
		Number,
		Toggle,
		Flex,
		Input
	} from '@layerd/ui';
	import { getTeamData } from '$site/lib/team/team.remote';
	import { getFaqData } from '$site/lib/faq/faq.remote';
	import { getPartnersData, type PartnerItem } from '$site/lib/partners/partners.remote';

	// Stats
	const stats = [
		{ value: 100, label: 'Years' },
		{ value: 5, label: 'Continents' },
		{ value: 11, label: 'Locations' },
		{ value: 69, label: 'Ports' }
	];
</script>

<!-- HERO 
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<Section
	id="Home"
	class="z-2 flex min-h-svh flex-col items-center"
>
	<!-- hero content
	------------------------------------------>
	<Container class="z-0 flex select-none flex-col items-center justify-around gap-14">
		<!-- title -->
		<div class="text-base-50 flex flex-col gap-2 text-center">
			<h1 class="order-2 text-balance text-xl font-bold leading-tight lg:text-6xl">
				<span>We are Port Captains, Surveyors and Transport Engineers</span>
			</h1>
			<h2 class="text-base-200 order-1 text-[x-small] uppercase tracking-widest lg:text-sm">
				Logistics Support Partner
			</h2>

			<!-- stats -->
			<div
				id="stats"
				class="order-3 flex items-center justify-center gap-6 py-8 text-center lg:gap-8"
			>
				{#each stats as stat}
					<section class="flex flex-col gap-2">
						<Number
							class="text-base-50 font-mono text-4xl font-bold md:text-4xl"
							data-target={stat.value}>{stat.value}</Number
						>
						<Text
							class="text-base-200 text-[x-small] uppercase lg:text-xs"
							h4={stat.label}
						/>
					</section>
				{/each}
			</div>
		</div>

		<!-- buttons -->
		<div class="flex w-full gap-2 lg:w-auto lg:gap-6">
			<Button
				size={mq.md ? 'xl' : 'md'}
				primary
				label="Learn More"
				class="w-full flex-1 lg:min-w-72"
				href="#About"
			/>
			<Button
				size={mq.md ? 'xl' : 'md'}
				base
				label="Contact sales"
				class="w-full flex-1 lg:min-w-72"
				href="#Contact"
			/>
		</div>
	</Container>

	<!-- photo vignette 
	------------------------------------------>
	<Image
		src="/photos/houston-night.jpg"
		bg="fixed"
		overlay="bg-radial -from-black to-black to-85%"
	/>
	<!-- bottom black radial 
	------------------------------------------>
	<Image
		bg
		class="mask-t-from-0% mask-t-to-50% origin-bottom overflow-hidden"
		overlay="bg-radial from-transparent to-black from-0% to-100% scale-x-125"
	/>

	<!-- GRADIENT WRAPPER
	------------------------------------------>
	<div
		class="-z-1 scale-y-60 pointer-events-none absolute inset-0 top-auto isolate size-full origin-bottom blur-xl"
	>
		<!-- top blue radial -->
		<Image
			bg
			class="mask-t-from-0% mask-t-to-70% absolute top-0 size-full overflow-hidden"
			overlay="bg-radial from-transparent to-primary from-20% to-100% "
		/>

		<!-- bottom blue radial -->
		<Image
			bg
			class="mask-b-from-0% mask-b-to-70% top-full size-full overflow-hidden"
			overlay="bg-radial from-transparent to-primary from-20% to-100% "
		/>
	</div>
</Section>

<!-- TRUSTED BY 
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<Section
	id="Partners"
	class="bg-dark-dark text-light-dark z-0 flex flex-col pt-20"
	container="!gap-10"
	divider="bottom"
	dividerBottom={{ svg: 'text-base-50-950' }}
>
	<Text
		class="text-base-300 text-center"
		h4="Trusted by over 200+ industry leaders"
		icon={false}
	/>

	<!-- partners -->
	<Container class="flex select-none flex-col items-center justify-around gap-14 pb-20">
		<div
			class="mask-lr grid grid-cols-2 items-center justify-center gap-8 invert sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8"
		>
			{#each getPartnersData().current ?? [] as partner (partner.id)}
				<img
					src={partner.img}
					alt={partner.name}
					class="h-8 w-auto max-w-32 shrink-0 place-self-center self-center object-contain lg:min-h-16"
				/>
			{/each}
		</div>
	</Container>

	<!-- testimonials -->
	<Container class="flex flex-col items-center justify-center gap-14 pb-20 ">
		<Card
			class="dark max-w-xl pl-14"
			variant="testimonial"
			title="Justin ONeill"
			subtitle="Arc Marine"
			description="Trident has been an invaluable partner in managing our complex logistics needs. Their expertise and dedication have significantly improved our operational efficiency."
		/>
	</Container>
</Section>

<!-- ABOUT 
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<Section
	divider
	class="flex flex-col"
>
	<Title
		id="About"
		title="Trident Cubed"
		subtitle="The founding partners behind Trident Cubed"
	/>

	<!-- team 
	------------------------------------------>
	<div class="team-container grid grid-cols-2 lg:grid-cols-4">
		{#each getTeamData().current as team (team.id)}
			<Card
				variant="profile"
				{...team}
			/>
		{/each}
	</div>

	<!-- about 
	------------------------------------------>
	<Container
		total="3"
		class="flex flex-col items-center justify-between gap-20 lg:flex-row even:lg:flex-row-reverse"
	>
		<Content
			type="text"
			class="w-full"
		/>
		<Image
			class="aspect-video lg:aspect-square"
			src="/photos/houston-night.jpg"
			mask
			overlay="bg-radial from-transparent to-black from-20% to-100% "
		/>
	</Container>
</Section>

<!-- SERVICES 
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<Section
	divider="both"
	dividerTop={{
		negative: true
	}}
	dividerBottom={{
		svg: 'text-base-200-700',
		negative: false
	}}
	class="bg-base-200-700 flex flex-col"
>
	<Title
		id="Services"
		title="Services"
		subtitle="The Standard in Marine Surveying & Port Captain Services"
	/>
	<div class="services-container">
		<Card
			class="overflow-hidden"
			glass
			variant="service"
			total="12"
		/>
	</div>
</Section>

<!-- CONTACT 
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<Section
	divider="both"
	dividerTop={{
		svg: 'text-base-200-700',
		negative: false
	}}
	dividerBottom={{
		negative: false
	}}
>
	<Title
		id="Contact"
		title="Contact Us"
		subtitle="We serve domestic and international waters"
	/>

	<Container
		class="relative flex flex-col items-stretch justify-center gap-32 lg:flex-row lg:items-start"
	>
		<!-- Contact Info 
		---------------------------------------------------->
		<div
			class="contact-info order-2 flex flex-col items-start gap-8 px-8 lg:order-1 lg:mt-2 lg:items-start"
		>
			<!-- Phone -->
			<div>
				<Text
					h3="Phone"
					class="bar-outside relative font-bold uppercase tracking-wider"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="+1 (570) 575-1179"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="+1 (832) 477-6974"
				/>
			</div>

			<!-- Email -->
			<div>
				<Text
					h3="Email"
					class="bar-outside relative font-bold uppercase tracking-wider"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="operations@tridentcubed.com"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="ops.sa@tridentcubed.com"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="ops.carib@tridentcubed.com"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="ops.eu@tridentcubed.com"
				/>
			</div>

			<!-- Location -->
			<div>
				<Text
					h3="Locations"
					class="bar-outside relative font-bold uppercase tracking-wider"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="800 Town and Country, Ste 500"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="Houston, TX 77024"
				/>
			</div>

			<!-- Hours -->
			<div>
				<Text
					h3="Hours"
					class="bar-outside relative font-bold uppercase tracking-wider"
				/>
				<Text
					class="text-base-600-300 text-md"
					p="Monday - Friday | 7:30am to 6:00pm"
				/>
			</div>
			<!-- Hours -->
			<div>
				<Text
					h3="Social"
					class="bar-outside relative font-bold uppercase tracking-wider"
				/>
				<!-- Web -->
				<div class="-ml-3 flex items-start justify-start">
					<Button
						lg
						variant="icon"
						href="https://www.facebook.com/TridentCubed"
						icon="icon-[mdi--facebook]"
						ghost
						external
						class="text-primary -mx-2"
					/>
					<Button
						lg
						variant="icon"
						href="https://www.linkedin.com/company/trident-cubed-solutions"
						icon="icon-[mdi--linkedin]"
						ghost
						external
						class="text-primary -mx-2"
					/>
					<Button
						lg
						variant="icon"
						href="https://wa.me/15705751179"
						icon="icon-[mdi--whatsapp]"
						ghost
						external
						class="text-primary -mx-2"
					/>
				</div>
			</div>
		</div>

		<!-- Contact Form
		---------------------------------------------------->
		<form
			class="contact-form sticky order-1 lg:top-32 lg:order-2"
			action=""
		>
			<Input
				icon="icon-[mdi--account]"
				variant="icon label"
				label="Name"
			/>
			<!-- 			
			<Input
				icon="icon-[mdi--phone]"
				variant="icon label"
				label="Phone"
			/> -->
			<Input
				icon="icon-[mdi--email]"
				variant="icon label"
				label="Email"
			/>
			<Input
				icon="icon-[mdi--pencil]"
				variant="icon label"
				label="Message"
				textarea
			/>
			<Button
				size="lg"
				primary
				label="Submit"
				class="mt-10 min-w-full !rounded-xl"
				href="#"
			/>
		</form>
	</Container>
</Section>

<!-- FAQ 
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<Section
	divider
	dividerBottom={{ svg: 'text-base-950' }}
	class="bg-base-200-700 flex flex-col gap-5"
>
	<Title
		id="FAQ"
		title="FAQ"
		subtitle="Common questions asked from new partners"
	/>
	<Content class="flex flex-col">
		{#each getFaqData().current as faq (faq.id)}
			<Toggle
				variant="panel"
				label={faq.label}
				class="border-base-300-700 border-b last:border-0"
				button={{
					icon: 'chevron-right',
					iconEndToggle: 'home',
					variant: 'text icon',
					width: 'full',
					padding: 'none',
					appearance: 'ghost',
					class: '!font-black !py-4  rounded-none hover:text-primary'
				}}
			>
				<p>{faq.content}</p>
			</Toggle>
		{/each}
	</Content>
</Section>

<!-- CTA 
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: -->
<Section
	class="dark flex flex-col py-0 text-center lg:items-start lg:justify-start lg:text-left"
	container="!gap-6 !pt-0 lg:!gap-6 flex w-full flex-col items-center lg:grid lg:grid-flow-col lg:grid-rows-2"
>
	<Text
		class="text-balance text-4xl md:text-pretty md:text-6xl"
		h1="Ready to become a partner?"
	/>
	<Text
		class="text-pretty md:max-w-xl md:text-balance"
		p="Join forces with Trident Cubed and gain a partner backed by 100+ years of combined experience."
	/>
	<Button
		size="xl"
		primary
		label="Contact sales"
		class="row-span-2 min-w-72 place-self-end self-center"
		href="#Contact"
	/>
</Section>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	:global {
		.services-container {
			@apply grid gap-4;
			grid-template-columns: repeat(auto-fit, minmax(25ch, 1fr));
		}
	}
</style>
