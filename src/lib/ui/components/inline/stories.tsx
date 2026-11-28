import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType } from "react";
import type { InlineProps } from ".";

import { Inline } from ".";

const item = "rounded-control bg-background-muted px-3 py-2 text-sm";

const meta: Meta<InlineProps<"div">> = {
	component: Inline,
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

type InlineStory<E extends ElementType = "div"> = StoryObj<InlineProps<E>>;

export const Default: InlineStory = {};

export const Small: InlineStory = {
	args: {
		gap: "xs",
	},
};

export const Large: InlineStory = {
	args: {
		gap: "xl",
	},
};
