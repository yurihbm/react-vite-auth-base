import type { Meta, StoryObj } from "@storybook/react-vite";
import type { AlertProps } from ".";

import { useState } from "react";

import { Alert } from ".";

const meta: Meta<AlertProps> = {
	component: Alert,
	args: {
		title: "Heads up",
	},
	argTypes: {
		color: {
			options: ["info", "success", "warning", "danger"],
			control: { type: "select" },
		},
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
	args: {
		color: "info",
		title: "Information",
	},
};

export const Success: Story = {
	args: {
		color: "success",
		title: "Success",
	},
};

export const Warning: Story = {
	args: {
		color: "warning",
		title: "Warning",
	},
};

export const Error: Story = {
	args: {
		color: "danger",
		title: "Error",
	},
};

export const WithDescription: Story = {
	args: {
		color: "info",
		title: "Update available",
		description: "A new version is ready to install.",
	},
};

export const TitleOnly: Story = {
	args: {
		color: "success",
		title: "Saved successfully",
	},
};

export const DescriptionOnly: Story = {
	args: {
		color: "warning",
		description: "Your session is about to expire.",
	},
};

export const Dismissible: Story = {
	args: {
		color: "info",
		title: "Dismiss me",
		description: "Click the close button to dismiss this alert.",
	},
	render: function Render(args) {
		const [visible, setVisible] = useState(true);

		if (!visible) {
			return <span>Alert dismissed.</span>;
		}

		return <Alert {...args} onDismiss={() => setVisible(false)} />;
	},
};
