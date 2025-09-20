import { prerender } from "$app/server";

interface TeamMember {
	id: string;
	title: string;
	subtitle: string;
	image: string;
	linkedin: string;
}

export const getTeamData = prerender(async () => {
	console.log("🔥 Fetching team members during prerender...");

	const response = await fetch(
		"https://sheetari.deno.dev/1BT2OPDOA-sEIF-JkyikVrB3StvsfdJNAnP4ih9bHhj4/team",
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch team: ${response.status}`);
	}

	const data = await response.json();

	// Map the API data to match the expected Card component structure
	const validMembers = data.map((member: any): TeamMember => ({
		id: member.id,
		title: member.name, // API 'name' maps to Card 'title'
		subtitle: member.title, // API 'title' maps to Card 'subtitle'
		image: member.src, // API 'src' maps to Card 'image'
		linkedin: member.linkedin,
	}));

	console.log("✅ Team members prerendered:", validMembers.length, "members");
	return validMembers;
}, {
	// This is crucial for no-argument prerender functions
	inputs: () => [undefined],
});
