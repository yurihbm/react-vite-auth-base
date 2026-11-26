import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { DeleteAccount } from ".";

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

const meta: Meta<typeof DeleteAccount> = {
	component: DeleteAccount,
	decorators: [withAuthProviders],
	args: { uuid: UUID },
};

export default meta;

type DeleteAccountStory = StoryObj<typeof DeleteAccount>;

export const Default: DeleteAccountStory = {};
