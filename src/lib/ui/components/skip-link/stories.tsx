import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SkipLinkProps } from ".";

import { SkipLink } from ".";

const meta: Meta<SkipLinkProps> = {
	component: SkipLink,
	args: {
		children: "Skip to content",
		href: "#main-content",
	},
};

export default meta;

type SkipLinkStory = StoryObj<SkipLinkProps>;

/** Hidden until focused: press Tab inside the canvas to reveal it. */
export const Default: SkipLinkStory = {};
