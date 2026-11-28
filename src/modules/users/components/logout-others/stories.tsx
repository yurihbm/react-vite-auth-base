import type { Meta, StoryObj } from "@storybook/react-vite";

import { withAuthProviders } from "@modules/auth/components/decorators";

import { LogoutOthers } from ".";

const meta: Meta<typeof LogoutOthers> = {
	component: LogoutOthers,
	decorators: [withAuthProviders],
};

export default meta;

type LogoutOthersStory = StoryObj<typeof LogoutOthers>;

export const Default: LogoutOthersStory = {};
