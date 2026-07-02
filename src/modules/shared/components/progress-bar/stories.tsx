import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ProgressBarProps } from ".";

import { ProgressBar } from ".";

const meta: Meta<ProgressBarProps> = {
	component: ProgressBar,
	args: {
		value: 50,
	},
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: { type: "select" },
		},
		color: {
			options: ["primary", "success", "warning", "danger"],
			control: { type: "select" },
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
	args: {
		label: "Uploading file",
		showValue: true,
	},
};

export const Indeterminate: Story = {
	args: {
		indeterminate: true,
		label: "Loading",
	},
};

export const Success: Story = {
	args: {
		color: "success",
		value: 100,
	},
};

export const Warning: Story = {
	args: {
		color: "warning",
		value: 65,
	},
};

export const Danger: Story = {
	args: {
		color: "danger",
		value: 20,
	},
};
