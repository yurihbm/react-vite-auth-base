/// <reference types="vitest/config" />

import path from "node:path";
import { fileURLToPath } from "node:url";

import babel from "@rolldown/plugin-babel";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
		babel({
			presets: [reactCompilerPreset()],
		}),
	],
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "src"),
		},
	},
	test: {
		coverage: {
			exclude: [
				// Storybook folder
				".storybook/**",
				// Barrel files
				"**/modules/*/components/index.ts",
				"**/modules/*/hooks/index.ts",
				"**/modules/*/services/index.ts",
				"**/modules/*/utils/index.ts",
				"**/modules/*/types/index.ts",
				"**/modules/*/index.ts",
				"**/lib/*/hooks/index.ts",
				"**/lib/*/utils/index.ts",
				"**/lib/*/index.ts",
				// Type-only files (no executable code)
				"**/types.ts",
				"**/types.d.ts",
				"**/vite-env.d.ts",
				// Routes (integration/entry points, not logic units)
				"**/routes/**",
				// App entry point (bootstrapping)
				"main.tsx",
				// Generated files
				"**/*.gen.ts",
				"**/*generated*",
				// CSS files
				"*.css",
			],
		},
		projects: [
			{
				extends: true,
				test: {
					name: "unit/integration",
					include: ["src/**/tests.{ts,tsx}"],
					clearMocks: true,
					environment: "happy-dom",
				},
			},
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, ".storybook"),
					}),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: "chromium",
							},
						],
					},
				},
			},
		],
	},
});
