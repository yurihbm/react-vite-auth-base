import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CheckboxProps } from ".";

import { Checkbox } from ".";

const meta: Meta<CheckboxProps> = {
	component: Checkbox,
	args: {
		label: "Accept terms and conditions",
	},
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type CheckboxStory = StoryObj<CheckboxProps>;

export const Default: CheckboxStory = {};

export const Checked: CheckboxStory = {
	args: {
		defaultChecked: true,
	},
};

export const Indeterminate: CheckboxStory = {
	args: {
		indeterminate: true,
		label: "Select all",
	},
};

export const Disabled: CheckboxStory = {
	args: {
		disabled: true,
	},
};

export const ErrorState: CheckboxStory = {
	args: {
		isError: true,
		message: "You must accept to continue.",
	},
};
