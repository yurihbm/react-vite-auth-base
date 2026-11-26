import type { Meta, StoryObj } from "@storybook/react-vite";
import type { RadioGroupProps } from ".";
import type { RadioOption } from "./types";

import { useState } from "react";

import { RadioGroup } from ".";

const items: RadioOption[] = [
	{ value: "free", label: "Free" },
	{ value: "pro", label: "Pro" },
	{ value: "enterprise", label: "Enterprise" },
];

const meta: Meta<RadioGroupProps> = {
	component: RadioGroup,
	args: {
		name: "plan",
		items,
		label: "Select a plan",
		defaultValue: "free",
	},
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: {
				type: "select",
			},
		},
		orientation: {
			options: ["vertical", "horizontal"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type RadioGroupStory = StoryObj<RadioGroupProps>;

export const Default: RadioGroupStory = {};

export const Horizontal: RadioGroupStory = {
	args: {
		orientation: "horizontal",
	},
};

export const WithError: RadioGroupStory = {
	args: {
		isError: true,
		message: "Please select a plan to continue.",
	},
};

export const WithDisabled: RadioGroupStory = {
	args: {
		items: [
			{ value: "free", label: "Free" },
			{ value: "pro", label: "Pro", disabled: true },
			{ value: "enterprise", label: "Enterprise" },
		],
	},
};

export const Controlled: RadioGroupStory = {
	render: function Render(args) {
		const [value, setValue] = useState("pro");

		return (
			<RadioGroup
				{...args}
				value={value}
				onChange={setValue}
				message={`Selected: ${value}`}
			/>
		);
	},
};
