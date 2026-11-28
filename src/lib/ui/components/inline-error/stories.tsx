import type { Meta, StoryObj } from "@storybook/react-vite";
import type { InlineErrorProps } from ".";

import { InlineError } from ".";

const meta: Meta<InlineErrorProps> = {
	component: InlineError,
	args: {
		children: "Could not load this user. Try again in a moment.",
	},
};

export default meta;

type InlineErrorStory = StoryObj<InlineErrorProps>;

export const Default: InlineErrorStory = {};
