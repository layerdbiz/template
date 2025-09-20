import { prerender } from "$app/server";

interface FaqItem {
	id: string;
	label: string;
	content: string;
	category: string;
}

export const getFaqData = prerender(async () => {
	console.log("🔥 Fetching FAQ items during prerender...");

	const response = await fetch(
		"https://sheetari.deno.dev/1BT2OPDOA-sEIF-JkyikVrB3StvsfdJNAnP4ih9bHhj4/faq",
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch FAQ: ${response.status}`);
	}

	const data = await response.json();

	// Map the API data to match the expected component structure
	const validFaqs = data.map((faq: any): FaqItem => ({
		id: faq.id,
		label: faq.question, // API 'question' maps to component 'label'
		content: faq.answer, // API 'answer' maps to component 'content'
		category: faq.category,
	}));

	console.log("✅ FAQ items prerendered:", validFaqs.length, "items");
	return validFaqs;
}, {
	// CRITICAL: Required for no-argument prerender functions due to async SSR limitations
	inputs: () => [undefined],
});
