import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeToggle } from ".";

const meta: Meta<typeof ThemeToggle> = {
	component: ThemeToggle,
};

export default meta;

type ThemeToggleStory = StoryObj<typeof ThemeToggle>;

export const Default: ThemeToggleStory = {};

export const CustomClasses: ThemeToggleStory = {
	args: {
		classNames: {
			toggleButton: "border border-border rounded-full",
		},
	},
};
