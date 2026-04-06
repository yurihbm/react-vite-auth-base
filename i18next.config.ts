import { defineConfig } from "i18next-cli";

import { DEFAULT_NAMESPACE, SUPPORTED_LANGUAGES } from "./src/lib/i18n";

export default defineConfig({
	// .map call is for type coercion to string[] since SUPPORTED_LANGUAGES is
	// a readonly array.
	locales: SUPPORTED_LANGUAGES.map((lng) => lng),
	extract: {
		input: ["src/**/*.{ts,tsx}"],
		output: "public/locales/{{language}}/{{namespace}}.json",
		defaultNS: DEFAULT_NAMESPACE,
		functions: ["t", "translate"],
		useTranslationNames: [
			"useTranslation",
			{
				name: "useTranslate",
				nsArg: 0,
			},
		],
	},
	types: {
		input: ["public/locales/en/*.json"],
		output: "src/lib/i18n/generated/i18n.d.ts",
		resourcesFile: "src/lib/i18n/generated/resources.d.ts",
		enableSelector: false,
	},
});
