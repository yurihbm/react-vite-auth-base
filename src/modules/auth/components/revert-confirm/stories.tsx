import type { Meta, StoryObj } from "@storybook/react-vite";

import { APIError } from "@lib/api";

import { RevertConfirm } from ".";

const meta: Meta<typeof RevertConfirm> = {
	component: RevertConfirm,
	args: {
		description:
			"This restores your previous email address and signs you out of every device.",
		confirmLabel: "Undo email change",
		successMessage:
			"Your previous email was restored and you were signed out of every device.",
		onConfirm: () => {},
	},
};

export default meta;

type RevertConfirmStory = StoryObj<typeof RevertConfirm>;

export const Default: RevertConfirmStory = {};

export const Pending: RevertConfirmStory = {
	args: {
		isPending: true,
	},
};

export const Success: RevertConfirmStory = {
	args: {
		isSuccess: true,
	},
};

export const WithError: RevertConfirmStory = {
	args: {
		error: new APIError("auth.oauthLink.staleToken", { status: 401 }),
	},
};
