import { defineConfig } from "i18next-cli";

import { defaultNS } from "./src/lib/i18n";

export default defineConfig({
	locales: ["en", "pt"],
	extract: {
		input: ["src/**/*.{ts,tsx}"],
		output: "public/locales/{{language}}/{{namespace}}.json",
		defaultNS,
	},
	types: {
		input: ["public/locales/en/*.json"],
		output: "src/types/i18next.d.ts",
		resourcesFile: "src/types/resources.d.ts",
		enableSelector: true,
	},
});
