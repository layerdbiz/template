import { query } from "$app/server";

export interface TeamMember {
	id: string;
	title: string;
	subtitle: string;
	image: string;
	icon: string; // Changed from linkedin to icon to match Card component
}

export const getTeamData = query(async () => {
	console.log("🔥 Fetching team members...");

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
		icon: member.linkedin, // API 'linkedin' maps to Card 'icon' (for LinkedIn URL)
	}));

	console.log("✅ Team members loaded:", validMembers.length, "members");
	return validMembers;
});
