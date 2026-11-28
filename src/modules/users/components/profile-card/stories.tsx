import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ProfileCard } from ".";

const meta: Meta<typeof ProfileCard> = {
	component: ProfileCard,
	args: {
		user: {
			uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
			name: "Test User",
			email: "test@mail.com",
			role: "user",
			createdAt: "2024-03-09T16:00:00.000Z",
			updatedAt: "2024-03-10T16:00:00.000Z",
		},
	},
	decorators: [withAuthProviders],
};

export default meta;

type ProfileCardStory = StoryObj<typeof ProfileCard>;

export const Default: ProfileCardStory = {};
