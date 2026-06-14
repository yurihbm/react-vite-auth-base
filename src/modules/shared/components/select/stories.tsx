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

const TOPPINGS: SelectOption[] = [
	{ label: "Cheese", value: "cheese" },
	{ label: "Pepperoni", value: "pepperoni" },
	{ label: "Mushroom", value: "mushroom" },
	{ label: "Onion", value: "onion" },
	{ label: "Pineapple", value: "pineapple", disabled: true },
];

const MANY: SelectOption[] = Array.from({ length: 5000 }, (_, i) => ({
	label: `Item ${i + 1}`,
	value: String(i + 1),
}));

const MANY_TAGS: SelectOption[] = Array.from({ length: 5000 }, (_, i) => ({
	label: `Tag ${i + 1}`,
	value: String(i + 1),
}));

export const Default: SelectStory = {
	render: function Render({
		label,
		placeholder,
		size,
		color,
		isError,
	}: SelectProps) {
		const [value, setValue] = useState<string | null>(null);

		return (
			<Select
				label={label}
				placeholder={placeholder}
				size={size}
				color={color}
				isError={isError}
				options={FRUITS}
				value={value}
				onChange={setValue}
			/>
		);
	},
};

export const LargeVirtualized: SelectStory = {
	render: function Render({ size, color, isError }: SelectProps) {
		const [value, setValue] = useState<string | null>(null);

		return (
			<Select
				label="Item (5,000 options)"
				placeholder="Select an item"
				size={size}
				color={color}
				isError={isError}
				options={MANY}
				value={value}
				onChange={setValue}
			/>
		);
	},
};

export const AsyncSearch: SelectStory = {
	render: function Render({ size, color, isError }: SelectProps) {
		const [value, setValue] = useState<string | null>(null);

		async function onSearch(query: string) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return MANY.filter((option) =>
				option.label.toLowerCase().includes(query.toLowerCase()),
			).slice(0, 50);
		}

		return (
			<Select
				label="Async search"
				placeholder="Search items"
				size={size}
				color={color}
				isError={isError}
				options={MANY.slice(0, 50)}
				value={value}
				onChange={setValue}
				onSearch={onSearch}
			/>
		);
	},
};

export const Multi: SelectStory = {
	render: function Render({ size, color, isError }: SelectProps) {
		const [value, setValue] = useState<string[]>(["cheese"]);

		return (
			<Select
				isMulti
				label="Toppings"
				placeholder="Select toppings"
				size={size}
				color={color}
				isError={isError}
				options={TOPPINGS}
				value={value}
				onChange={setValue}
			/>
		);
	},
};

export const MultiLargeVirtualized: SelectStory = {
	render: function Render({ size, color, isError }: SelectProps) {
		const [value, setValue] = useState<string[]>([]);

		return (
			<Select
				isMulti
				label="Tags (5,000 options)"
				placeholder="Select tags"
				size={size}
				color={color}
				isError={isError}
				options={MANY_TAGS}
				value={value}
				onChange={setValue}
			/>
		);
	},
};
