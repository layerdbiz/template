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
		Input,
		Slider
	} from '@layerd/ui';
	import { getTeamData } from '$lib/team/team.remote';
	import { getFaqData } from '$lib/faq/faq.remote';
	import { getPartnersData, type PartnerProps } from '$lib/partners/partners.remote';
	import { getServicesData } from '$lib/services/services.remote';
	import { getTestimonialsData } from '$lib/testimonials/testimonials.remote';

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
				size={mq.md ? 'xl' : 'sm'}
				primary
				variant="icon text"
				icon="icon-[mdi--play-circle-outline]"
				label="Learn More"
				class="w-full flex-1 lg:min-w-72"
				href="#About"
			/>
			<Button
				size={mq.md ? 'xl' : 'sm'}
				base
				variant="text icon"
				icon="icon-[mdi--chevron-right]"
				label="Contact Sales"
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
	<Image
		bg
		overlay="bg-black/30"
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
	class="bg-dark-dark text-light-dark z-0 flex flex-col overflow-clip pt-20"
	container="!gap-10 !p-0"
	divider="bottom"
	dividerBottom={{ svg: 'text-base-50-950' }}
>
	<Text
		class="text-base-300 text-center"
		h4="Trusted by over 200+ industry leaders"
		icon={false}
	/>

	<!-- partners -->
	{#if mq.lg}
		<!-- Desktop: 8 cols x 2 rows grid -->
		<svelte:boundary>
			<div class="mask-x-lg lg:mask-[unset] grid grid-cols-8 gap-8 pb-20 invert">
				{#await getPartnersData()}
					<!-- Loading state -->
					{#each Array(16) as _}
						<div class="h-12 w-auto animate-pulse rounded bg-gray-300"></div>
					{/each}
				{:then partners}
					{#each partners as partner (partner.id)}
						<img
							src={partner.img}
							alt={partner.name}
							class="h-12 w-auto place-self-center object-contain"
						/>
					{/each}
				{/await}
			</div>

			{#snippet pending()}
				<div class="flex items-center justify-center pb-20">
					<p class="text-base-300">Loading partners...</p>
				</div>
			{/snippet}
		</svelte:boundary>
	{:else}
		<!-- Mobile: Slider with autoscroll (improved speed) -->
		<Slider
			class="mask-x-lg bleed overflow-hidden"
			show={3}
			loop={true}
			autoscroll={0.25}
			container="gap-4"
			slide="flex-none"
		>
			<svelte:boundary>
				{#await getPartnersData()}
					<!-- Loading state -->
					{#each Array(6) as _}
						<div class="h-12 w-auto flex-none animate-pulse rounded bg-gray-300"></div>
					{/each}
				{:then partners}
					{#each partners as partner (partner.id)}
						<img
							src={partner.img}
							alt={partner.name}
							class="h-12 w-auto object-contain invert"
						/>
					{/each}
				{/await}

				{#snippet pending()}
					<div class="flex items-center justify-center">
						<p class="text-base-300">Loading partners...</p>
					</div>
				{/snippet}
			</svelte:boundary>
		</Slider>
	{/if}

	<!-- testimonials -->
	<Slider
		class="mask-x-md lg:mask-x-lg bleed overflow-x-clip pb-20"
		variant="autoplay"
		show={3}
		loop={true}
		duration={7000}
	>
		<svelte:boundary>
			{#await getTestimonialsData()}
				<!-- Loading state for testimonials -->
				{#each Array(3) as _}
					<Card
						class="dark animate-pulse pl-7 transition-all duration-300 lg:pl-14"
						variant="testimonial"
						title="Loading..."
						subtitle="Loading..."
						description="Loading testimonial content..."
					/>
				{/each}
			{:then testimonials}
				{#each testimonials as testimonial (testimonial.id)}
					<Card
						class="dark pl-7 transition-all duration-300 lg:pl-14"
						variant="testimonial"
						title={testimonial.title}
						subtitle={testimonial.subtitle}
						description={testimonial.description}
					/>
				{/each}
			{/await}

			{#snippet pending()}
				<div class="flex items-center justify-center">
					<p class="text-base-300">Loading testimonials...</p>
				</div>
			{/snippet}
		</svelte:boundary>
	</Slider>
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
	<Slider
		class="bleed-container mask-x-sm lg:mask-[unset] pb-10 lg:cursor-auto"
		variant="autoplay"
		show={4}
		loop={true}
		duration={4000}
		disabled="lg"
	>
		<svelte:boundary>
			{#await getTeamData()}
				<!-- Loading state for team -->
				{#each Array(4) as _}
					<Card
						variant="profile"
						title="Loading..."
						subtitle="Loading..."
						image="https://picsum.photos/id/420/240/360"
						icon="carbon:user"
					/>
				{/each}
			{:then team}
				{#each team as member (member.id)}
					<Card
						variant="profile"
						title={member.title}
						subtitle={member.subtitle}
						image={member.image}
						icon={member.icon}
					/>
				{/each}
			{/await}

			{#snippet pending()}
				<div class="flex items-center justify-center">
					<p class="text-base-600">Loading team...</p>
				</div>
			{/snippet}
		</svelte:boundary>
	</Slider>
	<!-- about 
	------------------------------------------>

	<!-- The Story Behind Trident -->
	<Container
		class="flex flex-col items-center justify-between gap-20 lg:flex-row even:lg:flex-row-reverse"
	>
		<Content
			type="text"
			class="w-full"
		>
			<!-- Title -->
			<h2 class="bar-outside">The Story Behind Trident</h2>
			<p>
				Trident Cubed was formed by a team of veteran mariners and engineers who saw a gap between
				what cargo owners were promised on paper and what actually happens at the hook, quay, and
				road. Founded in 2020 and headquartered in Houston, we built the company around one simple
				idea: put seasoned decision-makers on the pier—people who can read a stow plan, speak to the
				crane, and solve problems before they become delays.
			</p>
			<!-- Description -->
			<h3>Mission</h3>
			<p>
				Our mission is to deliver safe, compliant, and efficient movement of project and breakbulk
				cargo—end to end. We combine port-captaincy, marine surveying, and transport engineering so
				clients get one accountable team that plans the work, supervises the lift, and documents the
				result.
			</p>
			<h3>Principles</h3>
			<p>
				Plan precisely. Communicate clearly. Document relentlessly. Those are the rules that guide
				every job we take, whether it’s a single heavy-lift or a multi-modal move across ports,
				barges, rail, and road.
			</p>
		</Content>
		<Image
			class="sticky top-32 aspect-video lg:aspect-square"
			src="/photos/team.webp"
			mask
			overlay="to-black from-20% to-100%"
		/>
	</Container>

	<!-- What We Do, Start to Finish -->
	<Container
		class="flex flex-col items-center justify-between gap-20 lg:flex-row even:lg:flex-row-reverse"
	>
		<Content
			type="text"
			class="w-full"
		>
			<!-- Title -->
			<h2 class="bar-outside">What We Do, Start to Finish</h2>
			<p>
				Trident Cubed provides Port Captain and Supercargo supervision, Marine Warranty and
				condition surveys, and cargo transport engineering. From method statements and lift plans to
				on-site execution and sign-off, we translate drawings into safe, repeatable operations that
				keep terminals moving and schedules intact.
			</p>
			<!-- Description -->
			<h3>Operational Discipline</h3>
			<p>
				Every operation is built on verified calculations, pre-lift briefings, and live supervision.
				We coordinate with stevedores, terminal ops, trucking and barge teams, aligning gear,
				sequencing, and weather windows so the cargo touches the ground exactly once.
			</p>
			<h3>Compliance & Documentation</h3>
			<p>
				We work to the CTU Code, OEM rigging limits, and carrier requirements, capturing the trail
				with checklists, photos, and reports clients can hand to insurers and auditors without
				rework. If something changes on site, we issue controlled updates and keep everyone aligned.
			</p>
		</Content>
		<Image
			class="sticky top-32 aspect-video lg:aspect-square"
			src="/photos/heavy-lift.webp"
			mask
			overlay="to-black from-20% to-100%"
		/>
	</Container>

	<!-- Why Partners Choose Trident -->
	<Container
		class="flex flex-col items-center justify-between gap-20 lg:flex-row even:lg:flex-row-reverse"
	>
		<Content
			type="text"
			class="w-full"
		>
			<!-- Title -->
			<h2 class="bar-outside">Why Partners Choose Trident</h2>
			<p>
				Clients bring us in because they need outcomes: fewer surprises on the pier, cleaner
				handoffs between modes, and reports that stand up to scrutiny. Our founding partners have
				decades on deck and in the field, and that experience shows up in faster decisions and
				shorter quay time.
			</p>
			<!-- Description -->
			<h3>Results You Can Measure</h3>
			<p>
				We reduce idle crane minutes through better sequencing, prevent re-stows with methodical
				load readiness checks, and close out jobs with complete evidence—so claims are avoided and
				lessons learned become standard practice on the next move.
			</p>
			<h3>Your Cargo, Our Accountability</h3>
			<p>
				From first survey to final lash, we act as a single point of accountability. If it lifts,
				rolls, barges, rails, or trucks, Trident Cubed plans it, supervises it, and documents it— so
				your team can focus on the rest of the mission with confidence.
			</p>
		</Content>
		<Image
			class="sticky top-32 aspect-video lg:aspect-square"
			src="/photos/trident-cubed-secured-cargo.png"
			mask
			overlay="to-black from-20% to-100%"
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
	<div class="services-container grid gap-6">
		<svelte:boundary>
			{#await getServicesData()}
				<!-- Loading state for services -->
				{#each Array(6) as _}
					<Card
						glass
						class="animate-pulse overflow-clip"
						variant="service"
						title="Loading..."
						description="Loading service information..."
						image="https://picsum.photos/id/420/240/360"
						label="Loading"
					/>
				{/each}
			{:then services}
				{#each services as service (service.id)}
					<Card
						glass
						class="overflow-clip"
						variant="service"
						title={service.title}
						description={service.description}
						image={service.image}
						label={service.label}
					/>
				{/each}
			{/await}

			{#snippet pending()}
				<div class="col-span-full flex items-center justify-center p-8">
					<p class="text-base-600">Loading services...</p>
				</div>
			{/snippet}
		</svelte:boundary>
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
		<svelte:boundary>
			{#await getFaqData()}
				<!-- Loading state for FAQ -->
				{#each Array(5) as _}
					<Toggle
						variant="panel"
						label="Loading question..."
						class="border-base-300-700 animate-pulse border-b last:border-0"
						button={{
							icon: 'icon-[mdi--chevron-right] transition-transform duration-200 rotate-0 text-2xl',
							iconToggle:
								'icon-[mdi--chevron-right] text-primary transition-transform duration-200 rotate-90 text-2xl',
							variant: 'text icon',
							width: 'full',
							padding: 'none',
							appearance: 'ghost',
							class: '!font-black hover:[&_.btn-icon]:text-primary'
						}}
					>
						<p>Loading answer...</p>
					</Toggle>
				{/each}
			{:then faqs}
				{#each faqs as faq (faq.id)}
					<Toggle
						variant="panel"
						label={faq.label}
						class="border-base-300-700 border-b last:border-0"
						button={{
							icon: 'icon-[mdi--chevron-right] transition-transform duration-200 rotate-0 text-2xl',
							iconToggle:
								'icon-[mdi--chevron-right] text-primary transition-transform duration-200 rotate-90 text-2xl',
							variant: 'text icon',
							width: 'full',
							padding: 'none',
							appearance: 'ghost',
							class: '!font-black hover:[&_.btn-icon]:text-primary'
						}}
					>
						<p>{faq.content}</p>
					</Toggle>
				{/each}
			{/await}

			{#snippet pending()}
				<div class="flex items-center justify-center p-8">
					<p class="text-base-600">Loading FAQ...</p>
				</div>
			{/snippet}
		</svelte:boundary>
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
		label="Contact Sales"
		class="row-span-2 min-w-72 place-self-end self-center"
		href="#Contact"
	/>
</Section>

<style lang="postcss">
	@reference "@layerd/ui/ui.css";

	:global {
		.services-container {
			grid-template-columns: repeat(auto-fit, minmax(30ch, 1fr));
		}

		/* Slider active state styling */
		.embla__slide {
			.card-testimonial {
				@apply scale-60 opacity-25 transition-all duration-300;
			}
		}

		.embla__slide.active {
			/* Active/snapped slide */
			.card-testimonial {
				@apply scale-100 opacity-100;
			}
		}
	}
</style>
