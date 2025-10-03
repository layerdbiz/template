import { prerender } from "$app/server";

// ✅ Export interface for TypeScript support in components
export interface SectionData {
	id: string;
	section: string;
	title: string;
	subtitle: string;
}

export const getSectionsData = prerender(async () => {
	console.log("🔥 Fetching sections data during prerender...");

	try {
		// Sheetari URL structure: https://sheetari.deno.dev/{sheetId}/{sheetName}
		const response = await fetch(
			"https://sheetari.deno.dev/1BT2OPDOA-sEIF-JkyikVrB3StvsfdJNAnP4ih9bHhj4/sections",
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch sections data: ${response.status}`);
		}

		const data = await response.json();

		// Validate data is an array
		if (!Array.isArray(data)) {
			console.error("❌ API returned non-array data:", data);
			return [];
		}

		// Map and filter the API data to match component expectations
		const validSections = data
			.filter((item: any) => item && item.id && item.section) // Filter out invalid entries
			.map((item: any): SectionData => ({
				id: String(item.id), // Ensure string type
				section: item.section, // Section identifier (Home, Partners, etc.)
				title: item.title || "", // Section title
				subtitle: item.subtitle || "", // Section subtitle
			}));

		console.log(
			"✅ Sections data prerendered:",
			validSections.length,
			"sections",
		);
		return validSections;
	} catch (error) {
		console.error("❌ Error fetching sections data:", error);
		// Return empty array as fallback to prevent crashes
		return [];
	}
}, {
	// CRITICAL: Required for no-argument prerender functions due to async SSR limitations
	inputs: () => [undefined],
});
