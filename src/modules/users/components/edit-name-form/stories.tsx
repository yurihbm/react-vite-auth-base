import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { EditNameForm } from ".";

const USER = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "John Doe",
	email: "john@doe.com",
	role: "user" as const,
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};

const meta: Meta<typeof EditNameForm> = {
	component: EditNameForm,
	decorators: [withAuthProviders],
	args: { user: USER },
};

export default meta;

type EditNameFormStory = StoryObj<typeof EditNameForm>;

export const Default: EditNameFormStory = {};
