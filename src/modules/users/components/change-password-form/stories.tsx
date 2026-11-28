import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ChangePasswordForm } from ".";

const meta: Meta<typeof ChangePasswordForm> = {
	component: ChangePasswordForm,
	decorators: [withAuthProviders],
};

export default meta;

type ChangePasswordFormStory = StoryObj<typeof ChangePasswordForm>;

export const Default: ChangePasswordFormStory = {};
