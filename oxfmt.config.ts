import type { FormatConfig } from "oxfmt";

const config: FormatConfig = {
	jsdoc: true,
	printWidth: 80,
	arrowParens: "always",
	endOfLine: "lf",
	objectWrap: "preserve",
	useTabs: true,
	tabWidth: 2,
	singleQuote: false,
	sortImports: {
		internalPattern: ["@src/"],
		newlinesBetween: false,
		groups: [
			"type-builtin",
			["type-external", "type-internal"],
			["type-parent", "type-sibling", "type-index"],
			{ newlinesBetween: true },
			"value-builtin",
			{ newlinesBetween: true },
			"value-external",
			{ newlinesBetween: true },
			"value-internal",
			{ newlinesBetween: true },
			["value-parent", "value-sibling", "value-index"],
			{ newlinesBetween: true },
			"unknown",
		],
	},
	sortPackageJson: false,
	sortTailwindcss: {
		stylesheet: "./src/main.css",
		functions: ["tv"],
	},
	ignorePatterns: ["routeTree.gen.ts", "pnpm-lock.yaml", "resources.d.ts"],
};

export default config;
