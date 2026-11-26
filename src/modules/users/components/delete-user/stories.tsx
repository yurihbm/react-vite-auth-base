import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { DeleteUser } from ".";

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

const meta: Meta<typeof DeleteUser> = {
	component: DeleteUser,
	decorators: [withAuthProviders],
	args: { uuid: UUID, onDeleted: () => {} },
};

export default meta;

type DeleteUserStory = StoryObj<typeof DeleteUser>;

export const Default: DeleteUserStory = {};
