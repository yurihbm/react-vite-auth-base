// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores([
		"coverage",
		"dist",
		"./src/types/resources.d.ts",
		"./src/routeTree.gen.ts",
	]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
	},
	{
		files: ["src/routes/**/*.{ts,tsx}"],
		rules: { "react-refresh/only-export-components": "off" },
	},
	{
		files: ["src/**/*.{ts,tsx}"],
		ignores: ["src/lib/i18n/**/*.{ts,tsx}"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					paths: [
						{
							name: "react-i18next",
							message: "Use @src/lib/i18n facade instead.",
						},
						{
							name: "i18next",
							message: "Use @src/lib/i18n facade instead.",
						},
					],
					patterns: [
						{
							group: ["react-i18next/*", "i18next/*"],
							message: "Use @src/lib/i18n facade instead.",
						},
					],
				},
			],
		},
	},
	eslintConfigPrettier,
	...pluginQuery.configs["flat/recommended"],
	...storybook.configs["flat/recommended"],
]);
