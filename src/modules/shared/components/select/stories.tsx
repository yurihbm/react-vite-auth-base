import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SelectProps } from ".";
import type { SelectOption } from "../option-list/types";

import { useState } from "react";

import { Select } from ".";

const meta: Meta<SelectProps> = {
	component: Select,
	args: {
		label: "Country",
		placeholder: "Select a country",
	},
	argTypes: {
		size: { options: ["sm", "md"], control: { type: "select" } },
		color: {
			options: ["primary", "secondary", "subtle"],
			control: { type: "select" },
		},
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

type SelectStory = StoryObj<SelectProps>;

const FRUITS: SelectOption[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Cherry", value: "cherry" },
	{ label: "Durian", value: "durian", disabled: true },
	{ label: "Elderberry", value: "elderberry" },
];

const MANY: SelectOption[] = Array.from({ length: 5000 }, (_, i) => ({
	label: `Item ${i + 1}`,
	value: String(i + 1),
}));

export const Default: SelectStory = {
	render: function Render(args) {
		const [value, setValue] = useState<string | null>(null);

		return (
			<Select {...args} options={FRUITS} value={value} onChange={setValue} />
		);
	},
};

export const LargeVirtualized: SelectStory = {
	render: function Render(args) {
		const [value, setValue] = useState<string | null>(null);

		return (
			<Select
				{...args}
				label="Item (5,000 options)"
				placeholder="Select an item"
				options={MANY}
				value={value}
				onChange={setValue}
			/>
		);
	},
};

export const AsyncSearch: SelectStory = {
	render: function Render(args) {
		const [value, setValue] = useState<string | null>(null);

		async function onSearch(query: string) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MANY.filter((option) =>
				option.label.toLowerCase().includes(query.toLowerCase()),
			).slice(0, 50);
		}

		return (
			<Select
				{...args}
				label="Async search"
				placeholder="Search items"
				options={MANY.slice(0, 50)}
				value={value}
				onChange={setValue}
				onSearch={onSearch}
			/>
		);
	},
};
