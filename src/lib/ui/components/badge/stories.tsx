import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType } from "react";
import type { BadgeProps } from ".";

import { Badge } from ".";

const meta: Meta<BadgeProps<"span">> = {
	component: Badge,
	args: {
		children: "Badge",
	},
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
		size: {
			options: ["sm", "md"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type BadgeStory<E extends ElementType = "span"> = StoryObj<BadgeProps<E>>;

export const Default: BadgeStory = {};

export const Colors: BadgeStory = {
	render: () => (
		<div className="flex flex-wrap items-center gap-2">
			<Badge color="primary">Primary</Badge>
			<Badge color="secondary">Secondary</Badge>
			<Badge color="subtle">Subtle</Badge>
			<Badge color="info">Info</Badge>
			<Badge color="success">Success</Badge>
			<Badge color="warning">Warning</Badge>
			<Badge color="danger">Danger</Badge>
		</div>
	),
};

export const Small: BadgeStory = {
	args: {
		size: "sm",
		color: "success",
		children: "Active",
	},
};
