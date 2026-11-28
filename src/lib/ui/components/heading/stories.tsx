import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType } from "react";
import type { HeadingProps } from ".";

import { Heading } from ".";

const meta: Meta<HeadingProps<"h2">> = {
	component: Heading,
	args: {
		children: "Account settings",
	},
	argTypes: {
		as: {
			table: {
				disable: true,
			},
		},
		level: {
			options: [1, 2, 3, 4],
			control: {
				type: "select",
			},
		},
		size: {
			options: ["xl", "lg", "md", "sm", "xs"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type HeadingStory<E extends ElementType = "h2"> = StoryObj<HeadingProps<E>>;

export const Default: HeadingStory = {};

export const Levels: HeadingStory = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Heading level={1}>Level 1 heading</Heading>
			<Heading level={2}>Level 2 heading</Heading>
			<Heading level={3}>Level 3 heading</Heading>
			<Heading level={4}>Level 4 heading</Heading>
		</div>
	),
};

export const SizeOverride: HeadingStory = {
	args: {
		level: 1,
		size: "md",
		children: "Level 1 heading at the md size",
	},
};
