// ESM syntax
import tailwindPostcss from "@tailwindcss/postcss";
import lightDarkFn from "@csstools/postcss-light-dark-function";

const isDev = process.env.NODE_ENV === "development";

export default {
	plugins: [
		tailwindPostcss(),
		// Only run expensive plugins in production
		!isDev && lightDarkFn({ preserve: false }),
	].filter(Boolean),
};
