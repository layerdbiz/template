/**
 * @fileoverview Example data for Globe component
 * Sample locations and ports data for testing and demonstration
 */

import type { Location, Port } from "./globe.svelte.ts";

export const exampleLocations: Location[] = [
	{
		location: "Houston",
		lat: 29.7604,
		lng: -95.3698,
		phone: "+1 (713) 555-0100",
		email: "houston@example.com",
	},
	{
		location: "Shanghai",
		lat: 31.2304,
		lng: 121.4737,
		phone: "+86 21 1234 5678",
		email: "shanghai@example.com",
	},
	{
		location: "Rotterdam",
		lat: 51.9225,
		lng: 4.47917,
		phone: "+31 10 123 4567",
		email: "rotterdam@example.com",
	},
	{
		location: "Singapore",
		lat: 1.3521,
		lng: 103.8198,
		phone: "+65 6123 4567",
		email: "singapore@example.com",
	},
	{
		location: "Los Angeles",
		lat: 34.0522,
		lng: -118.2437,
		phone: "+1 (213) 555-0200",
		email: "la@example.com",
	},
];

export const examplePorts: Port[] = [
	// Houston Ports
	{
		port: "Port of Houston",
		city: "Houston",
		location: "Houston",
		lat: 29.7366,
		lng: -95.2656,
	},
	{
		port: "Bayport Container Terminal",
		city: "Pasadena",
		location: "Houston",
		lat: 29.6533,
		lng: -95.0766,
	},
	{
		port: "Barbours Cut Terminal",
		city: "La Porte",
		location: "Houston",
		lat: 29.6783,
		lng: -95.0516,
	},

	// Shanghai Ports
	{
		port: "Yangshan Port",
		city: "Shanghai",
		location: "Shanghai",
		lat: 30.6166,
		lng: 122.0649,
	},
	{
		port: "Waigaoqiao Port",
		city: "Shanghai",
		location: "Shanghai",
		lat: 31.3585,
		lng: 121.6308,
	},
	{
		port: "Shanghai Pudong",
		city: "Pudong",
		location: "Shanghai",
		lat: 31.2231,
		lng: 121.5397,
	},

	// Rotterdam Ports
	{
		port: "Port of Rotterdam",
		city: "Rotterdam",
		location: "Rotterdam",
		lat: 51.9511,
		lng: 4.1426,
	},
	{
		port: "Euromax Terminal",
		city: "Rotterdam",
		location: "Rotterdam",
		lat: 51.9436,
		lng: 4.1219,
	},

	// Singapore Ports
	{
		port: "PSA Singapore",
		city: "Singapore",
		location: "Singapore",
		lat: 1.2644,
		lng: 103.8223,
	},
	{
		port: "Jurong Port",
		city: "Jurong",
		location: "Singapore",
		lat: 1.2931,
		lng: 103.7264,
	},
	{
		port: "Pasir Panjang Terminal",
		city: "Singapore",
		location: "Singapore",
		lat: 1.2731,
		lng: 103.7847,
	},

	// Los Angeles Ports
	{
		port: "Port of Los Angeles",
		city: "San Pedro",
		location: "Los Angeles",
		lat: 33.7406,
		lng: -118.2729,
	},
	{
		port: "Port of Long Beach",
		city: "Long Beach",
		location: "Los Angeles",
		lat: 33.7676,
		lng: -118.2142,
	},
];

/**
 * Example usage of Globe component
 *
 * @example
 * ```svelte
 * <script>
 *   import { Globe } from '@layerd/ui';
 *   import { exampleLocations, examplePorts } from '@layerd/ui/organisms/globe/globe.data';
 * </script>
 *
 * <div class="w-full h-screen">
 *   <Globe locations={exampleLocations} ports={examplePorts} />
 * </div>
 * ```
 */
