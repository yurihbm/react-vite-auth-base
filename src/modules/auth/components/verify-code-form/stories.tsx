import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { VerifyCodeForm } from ".";

const meta: Meta<typeof VerifyCodeForm> = {
	component: VerifyCodeForm,
	decorators: [withAuthProviders],
};

export default meta;

type VerifyCodeFormStory = StoryObj<typeof VerifyCodeForm>;

export const Default: VerifyCodeFormStory = {};

export const WithRedirect: VerifyCodeFormStory = {
	args: {
		redirectTo: "/account",
	},
};
