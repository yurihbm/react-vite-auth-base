import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType } from "react";
import type { ButtonProps } from ".";

import { Button } from ".";

const meta: Meta<ButtonProps<"button">> = {
	component: Button,
	argTypes: {
		as: {
			table: {
				disable: true,
			},
		},
		color: {
			options: [
				"primary",
				"secondary",
				"subtle",
				"info",
				"success",
				"warning",
				"danger",
			],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type ButtonStory<E extends ElementType = "button"> = StoryObj<ButtonProps<E>>;

export const Default: ButtonStory = {
	args: {
		children: "Click me",
	},
};

export const Colors: ButtonStory = {
	args: {
		children: "Click me",
		color: "secondary",
	},
	argTypes: {
		color: {
			control: {
				type: "select",
			},
		},
	},
};

export const AsLink: ButtonStory<"a"> = {
	args: {
		children: "Go to repo",
		as: "a",
		href: "https://github.com/yurihbm/react-vite-auth-base",
		target: "_blank",
	},
};

export const Disabled: ButtonStory = {
	args: {
		children: "Can't click me",
		disabled: true,
	},
};
