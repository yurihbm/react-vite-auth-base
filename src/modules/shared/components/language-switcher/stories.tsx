import type { Meta, StoryObj } from "@storybook/react-vite";

import { LanguageSwitcher } from ".";

const meta: Meta<typeof LanguageSwitcher> = {
	component: LanguageSwitcher,
};

export default meta;

type LanguageSwitcherStory = StoryObj<typeof LanguageSwitcher>;

export const Default: LanguageSwitcherStory = {};

export const CustomClasses: LanguageSwitcherStory = {
	args: {
		classNames: {
			base: "bg-background-elevated rounded p-2 w-fit",
			switchButton: "border border-border",
		},
	},
};
