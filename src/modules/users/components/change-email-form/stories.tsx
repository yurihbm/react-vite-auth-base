import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ChangeEmailForm } from ".";

const meta: Meta<typeof ChangeEmailForm> = {
	component: ChangeEmailForm,
	decorators: [withAuthProviders],
};

export default meta;

type ChangeEmailFormStory = StoryObj<typeof ChangeEmailForm>;

export const Default: ChangeEmailFormStory = {};
