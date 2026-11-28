import type { Meta, StoryObj } from "@storybook/react-vite";

import { APIError } from "@lib/api";

import { StepUpDialog } from ".";

const meta: Meta<typeof StepUpDialog> = {
	component: StepUpDialog,
	args: {
		open: true,
		isSending: false,
		isVerifying: false,
		resendIn: 0,
		onSubmit: () => {},
		onResend: () => {},
		onCancel: () => {},
	},
};

export default meta;

type StepUpDialogStory = StoryObj<typeof StepUpDialog>;

export const Default: StepUpDialogStory = {};

export const Verifying: StepUpDialogStory = {
	args: { isVerifying: true },
};

export const ResendCooldown: StepUpDialogStory = {
	args: { resendIn: 42 },
};

export const InvalidCode: StepUpDialogStory = {
	args: {
		verifyError: new APIError("auth.stepUp.invalidCode", {
			status: 401,
			key: "auth.stepUp.invalidCode",
		}),
	},
};

export const UserLocked: StepUpDialogStory = {
	args: {
		verifyError: new APIError("auth.stepUp.userLocked", {
			status: 429,
			key: "auth.stepUp.userLocked",
		}),
	},
};
