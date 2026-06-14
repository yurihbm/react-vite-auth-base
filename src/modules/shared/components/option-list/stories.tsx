import type { Meta, StoryObj } from "@storybook/react-vite";
import type { OptionListProps } from ".";
import type { SelectOption } from "./types";

import { useState } from "react";

import { OptionList } from ".";

const meta: Meta<OptionListProps> = {
	component: OptionList,
	decorators: [
		(Story) => (
			<div className="max-w-72 rounded border border-border bg-background-muted">
				<Story />
			</div>
		),
	],
};

export default meta;

type OptionListStory = StoryObj<OptionListProps>;

const MANY_OPTIONS: SelectOption[] = Array.from({ length: 1000 }, (_, i) => ({
	label: `Option ${i + 1}`,
	value: String(i + 1),
}));

export const Single: OptionListStory = {
	render: function Render() {
		const [value, setValue] = useState<string | null>("3");

		return (
			<OptionList
				options={MANY_OPTIONS}
				activeIndex={-1}
				getIsSelected={(option) => option.value === value}
				onSelect={(option) => setValue(option.value)}
			/>
		);
	},
};

export const Multi: OptionListStory = {
	render: function Render() {
		const [values, setValues] = useState<string[]>(["1", "2"]);

		return (
			<OptionList
				multi
				options={MANY_OPTIONS}
				activeIndex={-1}
				getIsSelected={(option) => values.includes(option.value)}
				onSelect={(option) =>
					setValues((current) =>
						current.includes(option.value)
							? current.filter((v) => v !== option.value)
							: [...current, option.value],
					)
				}
			/>
		);
	},
};

export const Empty: OptionListStory = {
	args: {
		options: [],
		activeIndex: -1,
		getIsSelected: () => false,
		onSelect: () => {},
		emptyMessage: "Nothing here yet",
	},
};
