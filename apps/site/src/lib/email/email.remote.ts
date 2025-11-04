import { query } from "$app/server";
import type { EmailSignatureData } from "@layerd/ui";
import * as v from "valibot";

// Base API URL
const API_BASE = "https://sheetari.deno.dev";
const PERSON_SHEET_ID = "1Eauw3boJ1Gu6B78ywFuYB_bE3H1yHZyes0U0Mg9qRUs";
const GROUP_SHEET_ID = "1Eauw3boJ1Gu6B78ywFuYB_bE3H1yHZyes0U0Mg9qRUs";
const SOCIAL_SHEET_ID = "1BT2OPDOA-sEIF-JkyikVrB3StvsfdJNAnP4ih9bHhj4";

// API endpoint builders
const PERSON_URL = `${API_BASE}/${PERSON_SHEET_ID}/person`;
const GROUP_URL = `${API_BASE}/${GROUP_SHEET_ID}/group`;
const SOCIAL_URL = `${API_BASE}/${SOCIAL_SHEET_ID}/social`;

// Type definitions for raw API responses
interface PersonAPIResponse {
	id: string;
	type: "person";
	name: string;
	title: string;
	phone: string;
	email: string;
	group: string;
	href: string;
	src: string;
	slug: string;
	rank?: string;
	location?: string;
}

interface GroupAPIResponse {
	id: string;
	type: "group";
	shortname: string;
	email: string;
	name: string;
	title: string;
	phone: string;
	href: string;
	src: string;
	slug: string;
}

interface SocialAPIResponse {
	id: string;
	name: string;
	href: string;
	src: string;
}

// Social links interface
export interface SocialLinks {
	linkedin?: string;
	facebook?: string;
	whatsapp?: string;
}

// Navigation types
export interface EmailNavigationData {
	persons: PersonAPIResponse[];
	groups: GroupAPIResponse[];
}

// Batch fetch multiple sheets using the same pattern as globe.remote.ts
const getSheetariEmailData = query.batch(v.string(), async (sheets) => {
	const responses = await Promise.all(
		sheets.map((sheet) => {
			const url = sheet === "social"
				? `${API_BASE}/${SOCIAL_SHEET_ID}/${sheet}`
				: `${API_BASE}/${PERSON_SHEET_ID}/${sheet}`;
			return fetch(url).then((r) => r.json());
		}),
	);

	// Return a function that maps sheet name to its data
	return (sheet) => responses[sheets.indexOf(sheet)];
});

/**
 * Fetch all person email signatures
 */
export const fetchPersons = query(async () => {
	const data = await getSheetariEmailData("person");
	return data as PersonAPIResponse[];
});

/**
 * Fetch all group email signatures
 */
export const fetchGroups = query(async () => {
	const data = await getSheetariEmailData("group");
	return data as GroupAPIResponse[];
});

/**
 * Fetch social links
 */
export const fetchSocials = query(async () => {
	const data = await getSheetariEmailData("social");
	const socialData = data as SocialAPIResponse[];

	// Convert array to object with lowercase keys
	const socialLinks: SocialLinks = {};
	socialData.forEach((social) => {
		const key = social.name.toLowerCase() as keyof SocialLinks;
		socialLinks[key] = social.href;
	});

	return socialLinks;
});

/**
 * Fetch all email signatures (for navigation and individual pages)
 */
export const fetchAllEmails = query(async () => {
	const [persons, groups] = await Promise.all([fetchPersons(), fetchGroups()]);

	return {
		persons: persons.sort((a, b) => {
			// Sort by rank first (lower is higher priority), then by name
			const rankA = parseInt(a.rank || "999");
			const rankB = parseInt(b.rank || "999");
			if (rankA !== rankB) return rankA - rankB;
			return a.name.localeCompare(b.name);
		}),
		groups: groups.sort((a, b) => a.shortname.localeCompare(b.shortname)),
	};
});
