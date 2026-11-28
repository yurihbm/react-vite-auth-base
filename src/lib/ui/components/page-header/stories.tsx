import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PageHeaderProps } from ".";

import { Button } from "@lib/ui/components/button";

import { PageHeader } from ".";

const meta: Meta<PageHeaderProps> = {
	component: PageHeader,
	args: {
		title: "Account",
		description: "Manage your profile and how you sign in.",
	},
};

export default meta;

type PageHeaderStory = StoryObj<PageHeaderProps>;

export const Default: PageHeaderStory = {};

export const TitleOnly: PageHeaderStory = {
	args: {
		description: undefined,
	},
};

export const WithBackLinkAndActions: PageHeaderStory = {
	args: {
		title: "Security",
		description: "Change your password, email and connected accounts.",
		backLink: (
			<a className="underline" href="#account">
				Back to account
			</a>
		),
		actions: <Button size="sm">Save changes</Button>,
	},
};
