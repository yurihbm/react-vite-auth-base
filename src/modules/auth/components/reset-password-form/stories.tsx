import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ResetPasswordForm } from ".";

const meta: Meta<typeof ResetPasswordForm> = {
	component: ResetPasswordForm,
	decorators: [withAuthProviders],
};

export default meta;

type ResetPasswordFormStory = StoryObj<typeof ResetPasswordForm>;

export const Default: ResetPasswordFormStory = {};
