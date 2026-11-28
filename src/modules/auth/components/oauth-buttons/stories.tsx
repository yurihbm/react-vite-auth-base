import type { Meta, StoryObj } from "@storybook/react-vite";

import { OAuthButtons } from ".";

const meta: Meta<typeof OAuthButtons> = {
	component: OAuthButtons,
};

export default meta;

type OAuthButtonsStory = StoryObj<typeof OAuthButtons>;

export const Default: OAuthButtonsStory = {};
