import * as v from "valibot";

// ✅ Validation patterns
const patterns = {
	name: /^[a-zA-Z\s\-\.\']{2,50}$/,
	phone: /^[\+]?[\d\s\-\(\)]{7,20}$/,
	email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	message: /^.{10,500}$/s,
};

// ✅ Client-side validation functions
export function validateField(
	fieldName: keyof typeof patterns,
	value: string,
): { isValid: boolean; error?: string } {
	try {
		switch (fieldName) {
			case "name":
				v.parse(
					v.pipe(
						v.string(),
						v.nonEmpty("Name is required"),
						v.regex(
							patterns.name,
							"Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes",
						),
					),
					value,
				);
				break;
			case "phone":
				v.parse(
					v.pipe(
						v.string(),
						v.nonEmpty("Phone is required"),
						v.regex(
							patterns.phone,
							"Please enter a valid phone number",
						),
					),
					value,
				);
				break;
			case "email":
				v.parse(
					v.pipe(
						v.string(),
						v.nonEmpty("Email is required"),
						v.email("Please enter a valid email address"),
						v.regex(patterns.email, "Email format is invalid"),
					),
					value,
				);
				break;
			case "message":
				v.parse(
					v.pipe(
						v.string(),
						v.nonEmpty("Message is required"),
						v.regex(
							patterns.message,
							"Please enter a longer message",
						),
					),
					value,
				);
				break;
		}
		return { isValid: true };
	} catch (error: any) {
		return { isValid: false, error: error.message };
	}
}
