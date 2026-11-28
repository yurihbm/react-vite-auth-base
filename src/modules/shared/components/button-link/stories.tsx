import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ButtonLink } from ".";

const meta: Meta<typeof ButtonLink> = {
	component: ButtonLink,
	args: {
		to: "/account/security",
		children: "Manage security",
	},
	decorators: [withAuthProviders],
};

export default meta;

type ButtonLinkStory = StoryObj<typeof ButtonLink>;

export const Default: ButtonLinkStory = {};

export const Outline: ButtonLinkStory = {
	args: {
		variant: "outline",
	},
};
