import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { ShortUuid } from ".";

const meta: Meta<typeof ShortUuid> = {
	component: ShortUuid,
	args: {
		uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	},
	decorators: [withAuthProviders],
};

export default meta;

type ShortUuidStory = StoryObj<typeof ShortUuid>;

export const Default: ShortUuidStory = {};

export const LinkedToUser: ShortUuidStory = {
	args: {
		linkToUser: true,
	},
};
