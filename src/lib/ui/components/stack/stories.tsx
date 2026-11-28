import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType } from "react";
import type { StackProps } from ".";

import { Stack } from ".";

const item = "rounded-control bg-background-muted px-3 py-2 text-sm";

const meta: Meta<StackProps<"div">> = {
	component: Stack,
	args: {
		children: (
			<>
				<div className={item}>First</div>
				<div className={item}>Second</div>
				<div className={item}>Third</div>
			</>
		),
	},
	argTypes: {
		as: {
			table: {
				disable: true,
			},
		},
		gap: {
			options: ["none", "xs", "sm", "md", "lg", "xl"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type StackStory<E extends ElementType = "div"> = StoryObj<StackProps<E>>;

export const Default: StackStory = {};

export const Small: StackStory = {
	args: {
		gap: "xs",
	},
};

export const Large: StackStory = {
	args: {
		gap: "xl",
	},
};
