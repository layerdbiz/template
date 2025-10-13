import { getRequestEvent, query } from "$app/server";
import * as v from "valibot";

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
