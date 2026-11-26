import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ResendButton } from ".";

const meta: Meta<typeof ResendButton> = {
	component: ResendButton,
	decorators: [withAuthProviders],
};

export default meta;

type ResendButtonStory = StoryObj<typeof ResendButton>;

export const Default: ResendButtonStory = {};
