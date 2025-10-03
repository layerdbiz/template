import { form } from "$app/server";
import * as v from "valibot";

// ✅ Contact form result interface
export interface ContactFormResult {
	success: boolean;
	message: string;
	errors?: Record<string, string>;
}

// ✅ Validation patterns
const patterns = {
	name: /^[a-zA-Z\s\-\.\']{2,50}$/,
	phone: /^[\+]?[\d\s\-\(\)]{7,20}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	message: /^.{10,500}$/s,
};

// ✅ Contact form schema using valibot with detailed validation
const contactFormSchema = v.object({
	name: v.pipe(
		v.string(),
		v.nonEmpty("Name is required"),
		v.regex(
			patterns.name,
			"Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes",
		),
	),
	phone: v.pipe(
		v.string(),
		v.nonEmpty("Phone is required"),
		v.regex(
			patterns.phone,
			"Please enter a valid phone number",
		),
	),
	email: v.pipe(
		v.string(),
		v.nonEmpty("Email is required"),
		v.email("Please enter a valid email address"),
		v.regex(patterns.email, "Email format is invalid"),
	),
	message: v.pipe(
		v.string(),
		v.nonEmpty("Message is required"),
		v.regex(patterns.message, "Please enter a longer message"),
	),
});

// Remote form function with valibot schema validation
export const submitContactData = form(
	contactFormSchema,
	async ({ name, phone, email, message }) => {
		console.log("🔥 Submitting contact form...");
		console.log("📝 Form data received:", { name, phone, email, message });

		try {
			// Submit to Zapier webhook (existing endpoint)
			const response = await fetch(
				"https://hooks.zapier.com/hooks/catch/1938175/u95bgyj/",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						name: name.trim(),
						phone: phone.trim(),
						email: email.trim(),
						message: message.trim(),
					}),
				},
			);

			if (!response.ok) {
				console.error(`❌ Zapier webhook failed: ${response.status}`);
				throw new Error(`Zapier webhook failed: ${response.status}`);
			}

			console.log("✅ Contact form submitted successfully");

			// Return success result
			return {
				success: true,
				message: "A sales agent will be reaching out soon.",
			} as ContactFormResult;
		} catch (error) {
			console.error("❌ Error submitting contact form:", error);

			// Return error result (don't throw to avoid error page)
			return {
				success: false,
				message: "Sorry, there was an error sending your message.",
			} as ContactFormResult;
		}
	},
);
