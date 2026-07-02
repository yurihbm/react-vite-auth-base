import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CardProps } from ".";

import { Card } from ".";

const meta: Meta<CardProps> = {
	component: Card,
	args: {
		children: "This is the card content.",
	},
	argTypes: {
		padding: {
			options: ["none", "sm", "md", "lg"],
			control: { type: "select" },
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeaderAndFooter: Story = {
	args: {
		header: "Card title",
		footer: "Card footer",
	},
};

export const NoPadding: Story = {
	args: {
		padding: "none",
		header: "Card title",
	},
};
