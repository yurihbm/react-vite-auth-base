import type { Config } from "prettier";
import type { PluginOptions } from "prettier-plugin-tailwindcss";

type PrettierConfig = Config & PluginOptions;

const config: PrettierConfig = {
	printWidth: 80,
	arrowParens: "always",
	endOfLine: "lf",
	objectWrap: "preserve",
	useTabs: true,
	tabWidth: 2,
	singleQuote: false,
	plugins: [
		"@ianvs/prettier-plugin-sort-imports",
		"prettier-plugin-tailwindcss",
	],
	importOrder: [
		"<TYPES>^(node:)",
		"<TYPES>",
		"<TYPES>^[.]",
		"",
		"<BUILTIN_MODULES>",
		"",
		"<THIRD_PARTY_MODULES>",
		"",
		"^(@src)(/.*)$",
		"",
		"^[.]",
	],
};

export default config;
