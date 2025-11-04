<script lang="ts">
	import { Email, Preview } from '@layerd/ui';
	import type { EmailSignatureData } from '@layerd/ui';

	// Sample data for Hector Ramirez
	const hectorRamirezData: EmailSignatureData = {
		id: '4',
		type: 'person',
		name: 'Hector Ramirez',
		title: 'Partner / Head of Operations',
		phone: '+1 (281) 769-8370',
		email: 'H.Ramirez@TridentCubed.com',
		group: 'ops.sa@tridentcubed.com, ops.carib@tridentcubed.com, ops.eu@tridentcubed.com',
		href: 'https://www.linkedin.com/in/hector-ramirez-15860543',
		src: 'https://tridentcubed.com/emails/profile-hector-ramirez.png',
		slug: 'hector-ramirez',
		socialLinks: {
			linkedin: 'https://www.linkedin.com/company/trident-cubed-solutions',
			facebook: 'https://www.facebook.com/TridentCubed',
			whatsapp: 'https://wa.me/15705751179'
		}
	};

	// Component reference for accessing getHTML()
	let emailComponent: { getHTML: () => string } | undefined = $state();
</script>

<div class="container">
	<!-- Hidden email component just to get the HTML -->
	<div style="display: none;">
		<Email
			data={hectorRamirezData}
			onMount={(instance) => (emailComponent = instance)}
		/>
	</div>

	<!-- Preview component that displays the HTML -->
	<Preview componentRef={emailComponent} />
</div>
