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
import { VitePWA } from "vite-plugin-pwa";

// Single place to rename the app: also update the <title> in index.html.
const APP_NAME = "React Vite Auth Base";
const APP_SHORT_NAME = "Auth Base";
const APP_DESCRIPTION =
	"A modular React frontend template with authentication.";

const dirname =
	typeof import.meta.dirname !== "undefined"
		? import.meta.dirname
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
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				id: "/",
				name: APP_NAME,
				short_name: APP_SHORT_NAME,
				description: APP_DESCRIPTION,
				start_url: "/",
				scope: "/",
				display: "standalone",
				theme_color: "#000000",
				background_color: "#000000",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			devOptions: {
				enabled: true,
			},
		}),
	],
	resolve: {
		alias: {
			"@modules": path.resolve(dirname, "src/modules"),
			"@lib": path.resolve(dirname, "src/lib"),
			"@src": path.resolve(dirname, "src"),
		},
	},
	build: {
		rolldownOptions: {
			output: {
				// Split the libraries every route loads at startup into their own
				// chunks, so no shared chunk exceeds the 500 kB warning limit and each
				// one stays cached across app deploys. Recharts and its dependency
				// tree get one chunk, loaded only by the routes with charts. Other
				// route-specific libraries (TanStack Table/Virtual) keep the automatic
				// splitting.
				codeSplitting: {
					groups: [
						{
							name: "vendor-react",
							test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
						},
						{
							name: "vendor-tanstack",
							test: /node_modules[\\/]@tanstack[\\/](history|query-core|react-query|react-router|react-store|router-core|store)[\\/]/,
						},
						{
							name: "vendor-i18n",
							test: /node_modules[\\/](i18next[^\\/]*|react-i18next)[\\/]/,
						},
						{
							name: "vendor-charts",
							test: /node_modules[\\/](recharts|d3-[^\\/]+|internmap|victory-vendor|@reduxjs[\\/]toolkit|redux|react-redux|reselect|immer|es-toolkit|decimal\.js-light|eventemitter3)[\\/]/,
						},
					],
				},
			},
		},
	},
	optimizeDeps: {
		// Only reachable through lazily code-split routes (`autoCodeSplitting`
		// above), so Vite's static crawler misses them until a test imports that
		// route, forcing a mid-run re-optimization. Listing them here makes Vite
		// pre-bundle them upfront instead.
		include: [
			"@tanstack/react-query",
			"@tanstack/react-query-devtools",
			"@tanstack/react-router",
			"@tanstack/react-router-devtools",
			"zod",
		],
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
				"**/lib/*/components/index.ts",
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
					setupFiles: ["./src/lib/tests/setup-i18n.ts"],
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
