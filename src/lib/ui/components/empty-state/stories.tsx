import type { Meta, StoryObj } from "@storybook/react-vite";
import type { EmptyStateProps } from ".";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { Button } from "@lib/ui/components/button";

import { EmptyState } from ".";

const meta: Meta<EmptyStateProps> = {
	component: EmptyState,
	args: {
		title: "No users found",
		description: "No users match these filters. Try a different search.",
	},
};

export default meta;

type EmptyStateStory = StoryObj<EmptyStateProps>;

export const Default: EmptyStateStory = {};

export const WithIconAndAction: EmptyStateStory = {
	args: {
		icon: <MagnifyingGlassIcon size={24} />,
		action: (
			<Button color="subtle" size="sm">
				Clear filters
			</Button>
		),
	},
};

export const TitleOnly: EmptyStateStory = {
	args: {
		title: "Nothing here yet",
		description: undefined,
	},
};
