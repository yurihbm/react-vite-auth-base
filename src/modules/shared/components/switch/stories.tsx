import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SwitchProps } from ".";

import { Switch } from ".";

const meta: Meta<SwitchProps> = {
	component: Switch,
	args: {
		label: "Dark mode",
	},
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: { type: "select" },
		},
	},
};

export default meta;

type SwitchStory = StoryObj<SwitchProps>;

export const Default: SwitchStory = {};

export const Checked: SwitchStory = {
	args: {
		defaultChecked: true,
	},
};

export const Small: SwitchStory = {
	args: {
		size: "sm",
	},
};

export const WithMessage: SwitchStory = {
	args: {
		message: "Applies immediately without saving.",
	},
};

export const ErrorState: SwitchStory = {
	args: {
		isError: true,
		message: "This setting is required.",
	},
};

export const Disabled: SwitchStory = {
	args: {
		disabled: true,
	},
};
