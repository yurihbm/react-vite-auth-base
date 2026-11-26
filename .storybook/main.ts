import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@storybook/addon-vitest",
		"@storybook/addon-a11y",
		"@storybook/addon-docs",
	],
	framework: "@storybook/react-vite",
	core: {
		disableTelemetry: true,
	},
	// The PWA service worker only belongs to the app's production build; its
	// precache size limit also rejects Storybook's large manager bundle.
	viteFinal: (config) => ({
		...config,
		plugins: config.plugins
			?.flat(Infinity)
			.filter(
				(plugin) =>
					!(
						plugin &&
						"name" in plugin &&
						plugin.name.startsWith("vite-plugin-pwa")
					),
			),
	}),
};
export default config;
