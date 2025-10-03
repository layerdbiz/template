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
	import { getAboutData } from '$lib/about/about.remote';
	import { getSectionsData } from '$lib/sections/sections.remote';
	import { submitContactData } from '$lib/contact/contact.remote';
	import { validateField } from '$lib/contact/validation';

	// Helper function for cleaner section access with await
	async function getSection(name: string) {
		const sections = await getSectionsData();
		return sections.find((s) => s.section === name);
	}

	// Stats
	const stats = [
		{ value: 100, label: 'Years' },
		{ value: 5, label: 'Continents' },
		{ value: 11, label: 'Locations' },
		{ value: 69, label: 'Ports' }
	];

	// Form clearing logic
	let formElement: HTMLFormElement;
	let isSubmitting = $state(false);
	let isSent = $state(false);

	// Form field values (still needed for form clearing)
	let nameValue = $state('');
	let phoneValue = $state('');
	let emailValue = $state('');
	let messageValue = $state('');

	// Validation error states (for visual feedback)
	let nameError = $state('');
	let phoneError = $state('');
	let emailError = $state('');
	let messageError = $state('');

	// Validation functions (for onblur feedback)
	function validateName() {
		const result = validateField('name', nameValue);
		nameError = result.error || '';
		return result.isValid;
	}

	function validatePhone() {
		const result = validateField('phone', phoneValue);
		phoneError = result.error || '';
		return result.isValid;
	}

	function validateEmail() {
		const result = validateField('email', emailValue);
		emailError = result.error || '';
		return result.isValid;
	}

	function validateMessage() {
		const result = validateField('message', messageValue);
		messageError = result.error || '';
		return result.isValid;
	}

	// Clear form when submission is successful
	$effect(() => {
		const result = submitContactData.result;
		if (result?.success && formElement) {
			formElement.reset();
			// Reset field values
			nameValue = '';
			phoneValue = '';
			emailValue = '';
			messageValue = '';
			// Clear errors
			nameError = '';
			phoneError = '';
			emailError = '';
			messageError = '';
		}
	});
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
			<svelte:boundary>
				<h1 class="order-2 text-balance text-xl font-bold leading-tight lg:text-6xl">
					<span>{(await getSection('Home'))?.title ?? 'Hero Title'}</span>
				</h1>
				<h2 class="text-base-200 order-1 text-[x-small] uppercase tracking-widest lg:text-sm">
					{(await getSection('Home'))?.subtitle ?? 'Hero Subtitle'}
				</h2>

				{#snippet pending()}
					<!-- Loading hero content -->
				{/snippet}
			</svelte:boundary>

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
	<svelte:boundary>
		<Text
			class="text-base-300 text-center"
			h4={(await getSection('Partners'))?.subtitle ?? 'Partners Subtitle'}
			icon={false}
		/>

		{#snippet pending()}
			<!-- Loading partners subtitle -->
		{/snippet}
	</svelte:boundary>

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
	<svelte:boundary>
		<Title
			id="About"
			title={(await getSection('About'))?.title ?? 'About Title'}
			subtitle={(await getSection('About'))?.subtitle ?? 'About Subtitle'}
		/>

		{#snippet pending()}
			<!-- Loading about title -->
		{/snippet}
	</svelte:boundary>

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

	{#each getAboutData().current ?? [] as section (section.id)}
		<Container
			class="flex flex-col items-center justify-between gap-20 lg:flex-row even:lg:flex-row-reverse"
		>
			<Content
				type="text"
				class="w-full"
			>
				<!-- Title -->
				<h2 class="bar-outside">{section.title}</h2>
				<p>{section.description}</p>

				<!-- Subsections -->
				{#each section.subsections as subsection}
					<h3>{subsection.title}</h3>
					<p>{subsection.content}</p>
				{/each}
			</Content>
			<Image
				class="sticky top-32 aspect-video lg:aspect-square"
				src={section.image}
				mask
				overlay="to-black from-20% to-100%"
			/>
		</Container>
	{/each}
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
	<svelte:boundary>
		<Title
			id="Services"
			title={(await getSection('Services'))?.title ?? 'Services Title'}
			subtitle={(await getSection('Services'))?.subtitle ?? 'Services Subtitle'}
		/>

		{#snippet pending()}
			<!-- Loading services title -->
		{/snippet}
	</svelte:boundary>
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
	<svelte:boundary>
		<Title
			id="Contact"
			title={(await getSection('Contact'))?.title ?? 'Contact Title'}
			subtitle={(await getSection('Contact'))?.subtitle ?? 'Contact Subtitle'}
		/>

		{#snippet pending()}
			<!-- Loading contact title -->
		{/snippet}
	</svelte:boundary>

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
			bind:this={formElement}
			class="contact-form w-xs sticky order-1 max-w-xs lg:top-32 lg:order-2"
			{...submitContactData.enhance(async ({ submit, form }) => {
				try {
					// HTML5 validation will prevent submission if fields are invalid
					isSubmitting = true;
					// Add 2 second delay to show loading state
					await new Promise((resolve) => setTimeout(resolve, 2000));
					await submit();

					// Show sent state
					isSubmitting = false;
					isSent = true;

					// Revert to idle state after 4 seconds
					setTimeout(() => {
						isSent = false;
					}, 4000);
				} catch (error) {
					console.error('Form submission error:', error);
					isSubmitting = false;
				}
			})}
		>
			<Input
				bind:value={nameValue}
				icon="icon-[mdi--account]"
				variant="icon label"
				label="Name"
				required={true}
				pattern="[a-zA-Z\\s\\-\\.\\']+"
				minlength={2}
				maxlength={50}
				error={nameError}
				isValid={!nameError}
				onblur={validateName}
			/>
			<Input
				bind:value={phoneValue}
				type="tel"
				icon="icon-[mdi--phone]"
				variant="icon label"
				label="Phone"
				required={true}
				pattern="[\\+\\d\\s\\-\\(\\)]+"
				minlength={7}
				maxlength={20}
				error={phoneError}
				isValid={!phoneError}
				onblur={validatePhone}
			/>
			<Input
				bind:value={emailValue}
				type="email"
				icon="icon-[mdi--email]"
				variant="icon label"
				label="Email"
				required={true}
				error={emailError}
				isValid={!emailError}
				onblur={validateEmail}
			/>
			<Input
				bind:value={messageValue}
				icon="icon-[mdi--pencil]"
				variant="icon label"
				label="Message"
				textarea
				required={true}
				minlength={10}
				maxlength={500}
				error={messageError}
				isValid={!messageError}
				onblur={validateMessage}
			/>
			<Button
				color={isSent ? 'accent' : 'primary'}
				type="submit"
				size="lg"
				label={isSent ? 'Sent!' : isSubmitting ? 'Sending...' : 'Send'}
				icon={isSent ? 'icon-[mdi--check]' : isSubmitting ? 'spinner' : 'icon-[mdi--send]'}
				variant="text icon"
				class="submit-button mt-10 min-w-full !rounded-xl disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isSubmitting || isSent}
			/>
			<!-- Success/Error Messages -->
			{#await submitContactData.result}
				<!-- Loading state handled by button -->
			{:then result}
				{#if result?.success}
					<div class="my-10 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
						<Text
							class="text-md text-emerald-600"
							p={result.message}
						/>
					</div>
				{:else if result && !result.success}
					<div class="my-10 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
						<Text
							class="text-md text-rose-600"
							p={result.message}
						/>
					</div>
				{/if}
			{/await}
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
	<svelte:boundary>
		<Title
			id="FAQ"
			title={(await getSection('FAQ'))?.title ?? 'FAQ Title'}
			subtitle={(await getSection('FAQ'))?.subtitle ?? 'FAQ Subtitle'}
		/>

		{#snippet pending()}
			<!-- Loading FAQ title -->
		{/snippet}
	</svelte:boundary>
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
	<svelte:boundary>
		<Text
			class="text-balance text-4xl md:text-pretty md:text-6xl"
			h1={(await getSection('CTA'))?.title ?? 'CTA Title'}
		/>
		<Text
			class="text-pretty md:max-w-xl md:text-balance"
			p={(await getSection('CTA'))?.subtitle ?? 'CTA Subtitle'}
		/>

		{#snippet pending()}
			<!-- Loading CTA content -->
		{/snippet}
	</svelte:boundary>
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

		/* Form validation styling */
		.contact-form:invalid .submit-button {
			@apply pointer-events-none cursor-not-allowed opacity-50;
		}

		.contact-form:valid .submit-button {
			@apply pointer-events-auto cursor-pointer opacity-100;
		}
	}
</style>
