import { getRequestEvent, query } from "$app/server";
import * as v from "valibot";

// ✅ Export interface for TypeScript support in components
export interface GlobeStatsData {
	continents: number;
	locations: number;
	ports: number;
}

// Batch fetch multiple sheets from the same Sheetari spreadsheet
const getSheetariData = query.batch(v.string(), async (sheets) => {
	const baseUrl =
		"https://sheetari.deno.dev/1_BNtsJr9TaSYRPFAKcAd9pa_TUQyYBfqEZiDvDvkPTw";

	// Fetch all sheets in parallel
	const responses = await Promise.all(
		sheets.map((sheet) => fetch(`${baseUrl}/${sheet}`).then((r) => r.json())),
	);

	// Return a function that maps sheet name to its data
	return (sheet) => responses[sheets.indexOf(sheet)];
});

// Query functions that use the batched data fetcher
export const getGlobeLocations = query(async () => {
	return getSheetariData("locations");
});

export const getGlobePorts = query(async () => {
	return getSheetariData("ports");
});

export const getGlobePolygons = query(async () => {
	const event = getRequestEvent();
	const response = await event.fetch("/data/countries.geojson");
	return response.json();
});

// Query function to get dynamic stats counts
export const getGlobeStatsData = query(async () => {
	console.log("🔥 Calculating globe stats counts...");

	try {
		// Fetch both sheets in parallel using the batched fetcher
		const locationsData = await getSheetariData("locations");
		const portsData = await getSheetariData("ports");

		// Validate data is arrays
		if (!Array.isArray(locationsData) || !Array.isArray(portsData)) {
			console.error("❌ API returned non-array data");
			return {
				continents: 0,
				locations: 0,
				ports: 0,
			};
		}

		// Count unique continents from locations sheet
		const uniqueContinents = new Set(
			locationsData
				.filter((item: any) => item?.continent)
				.map((item: any) => String(item.continent).trim()),
		);

		// Count unique locations from locations sheet
		const uniqueLocations = new Set(
			locationsData
				.filter((item: any) => item?.location)
				.map((item: any) => String(item.location).trim()),
		);

		// Count unique ports from ports sheet
		const uniquePorts = new Set(
			portsData
				.filter((item: any) => item?.port)
				.map((item: any) => String(item.port).trim()),
		);

		const stats: GlobeStatsData = {
			continents: uniqueContinents.size,
			locations: uniqueLocations.size,
			ports: uniquePorts.size,
		};

		console.log("✅ Globe stats calculated:", stats);
		return stats;
	} catch (error) {
		console.error("❌ Error calculating globe stats:", error);
		// Return zeros as fallback to prevent crashes
		return {
			continents: 0,
			locations: 0,
			ports: 0,
		};
	}
});
