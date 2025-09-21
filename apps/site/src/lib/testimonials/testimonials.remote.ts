import { prerender } from "$app/server";

// ✅ Export interface for TypeScript support in components
export interface TestimonialData {
	id: string;
	title: string;
	subtitle: string;
	description: string;
	name?: string;
	company?: string;
}

export const getTestimonialsData = prerender(async () => {
	console.log("🔥 Fetching testimonials data during prerender...");

	try {
		// Sheetari URL structure: https://sheetari.deno.dev/{sheetId}/{sheetName}
		const response = await fetch(
			"https://sheetari.deno.dev/1BT2OPDOA-sEIF-JkyikVrB3StvsfdJNAnP4ih9bHhj4/testimonials",
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch testimonials data: ${response.status}`);
		}

		const data = await response.json();

		// Validate data is an array
		if (!Array.isArray(data)) {
			console.error("❌ API returned non-array data:", data);
			return [];
		}

		// Map and filter the API data to match component expectations
		const validTestimonials = data
			.filter((item: any) =>
				item && item.id && (item.title || item.name) && item.description
			) // Filter out invalid entries
			.map((item: any): TestimonialData => ({
				id: String(item.id), // Ensure string type
				title: item.title || item.name || "Anonymous", // Map API fields to component props
				subtitle: item.subtitle || item.company || "Customer",
				description: item.description || item.quote || "Great service!",
				name: item.name,
				company: item.company,
			}));

		console.log(
			"✅ Testimonials data prerendered:",
			validTestimonials.length,
			"items",
		);
		return validTestimonials;
	} catch (error) {
		console.error("❌ Error fetching testimonials data:", error);
		// Return empty array as fallback to prevent crashes
		return [];
	}
}, {
	// CRITICAL: Required for no-argument prerender functions due to async SSR limitations
	inputs: () => [undefined],
});
