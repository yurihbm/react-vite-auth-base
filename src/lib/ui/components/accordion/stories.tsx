import type { Meta, StoryObj } from "@storybook/react-vite";
import type { AccordionProps } from ".";

import { useState } from "react";

import { Accordion } from ".";

const items: AccordionProps["items"] = [
	{
		value: "shipping",
		title: "What are the shipping options?",
		content: "We offer standard, expedited, and overnight shipping.",
	},
	{
		value: "returns",
		title: "What is your return policy?",
		content: "Items can be returned within 30 days of purchase.",
	},
	{
		value: "support",
		title: "How do I contact support?",
		content: "Email us at support@example.com or use the in-app chat.",
		disabled: true,
	},
];

const meta: Meta<AccordionProps> = {
	component: Accordion,
	args: {
		items,
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		type: "single",
	},
};

export const Multiple: Story = {
	args: {
		type: "multiple",
	},
};

export const WithDisabledItem: Story = {
	args: {
		type: "single",
	},
};

export const Controlled: Story = {
	render: function Render(args) {
		const [value, setValue] = useState<string[]>(["shipping"]);

		return <Accordion {...args} value={value} onChange={setValue} />;
	},
};
