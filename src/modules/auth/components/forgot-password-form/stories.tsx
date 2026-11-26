import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ForgotPasswordForm } from ".";

const meta: Meta<typeof ForgotPasswordForm> = {
	component: ForgotPasswordForm,
	decorators: [withAuthProviders],
};

export default meta;

type ForgotPasswordFormStory = StoryObj<typeof ForgotPasswordForm>;

export const Default: ForgotPasswordFormStory = {};
