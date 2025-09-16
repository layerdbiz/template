// ESM syntax
import tailwindPostcss from "@tailwindcss/postcss";
import lightDarkFn from "@csstools/postcss-light-dark-function";

export default {
	plugins: [
		tailwindPostcss(),
		lightDarkFn({ preserve: false }),
	],
};
