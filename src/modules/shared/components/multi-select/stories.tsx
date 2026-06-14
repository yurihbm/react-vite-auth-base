import type { Meta, StoryObj } from "@storybook/react-vite";
import type { MultiSelectProps } from ".";
import type { SelectOption } from "../option-list/types";

import { useState } from "react";

import { MultiSelect } from ".";

const meta: Meta<MultiSelectProps> = {
	component: MultiSelect,
	args: {
		label: "Toppings",
		placeholder: "Select toppings",
	},
	argTypes: {
		size: { options: ["sm", "md"], control: { type: "select" } },
	},
	decorators: [
		(Story) => (
			<div className="max-w-72">
				<Story />
			</div>
		),
	],
};

export default meta;

type MultiSelectStory = StoryObj<MultiSelectProps>;

const TOPPINGS: SelectOption[] = [
	{ label: "Cheese", value: "cheese" },
	{ label: "Pepperoni", value: "pepperoni" },
	{ label: "Mushroom", value: "mushroom" },
	{ label: "Onion", value: "onion" },
	{ label: "Pineapple", value: "pineapple", disabled: true },
];

const MANY: SelectOption[] = Array.from({ length: 5000 }, (_, i) => ({
	label: `Tag ${i + 1}`,
	value: String(i + 1),
}));

export const Default: MultiSelectStory = {
	render: function Render(args) {
		const [value, setValue] = useState<string[]>(["cheese"]);

		return (
			<MultiSelect
				{...args}
				options={TOPPINGS}
				value={value}
				onChange={setValue}
			/>
		);
	},
};

export const LargeVirtualized: MultiSelectStory = {
	render: function Render(args) {
		const [value, setValue] = useState<string[]>([]);

		return (
			<MultiSelect
				{...args}
				label="Tags (5,000 options)"
				placeholder="Select tags"
				options={MANY}
				value={value}
				onChange={setValue}
			/>
		);
	},
};
