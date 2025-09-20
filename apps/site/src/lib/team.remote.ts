import { prerender } from "$app/server";

export interface TeamData {
	name: string;
	title: string;
}

export const team = prerender(async () => {
	console.log("🔥 Fetching teams during prerender...");

	const response = await fetch(
		"https://sheetari.deno.dev/1BT2OPDOA-sEIF-JkyikVrB3StvsfdJNAnP4ih9bHhj4/team",
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch teams: ${response.status}`);
	}

	const data: TeamData[] = await response.json();

	// Return the full objects with team and category properties
	const validTeams = data.filter((entry) =>
		entry.name && typeof entry.name === "string" &&
		entry.title && typeof entry.title === "string"
	);

	console.log("✅ Teams prerendered:", validTeams.length, "teams");
	return validTeams;
}, {
	// This is crucial for no-argument prerender functions
	inputs: () => [undefined],
});
