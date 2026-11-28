import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DescriptionListProps } from ".";

import { Badge } from "@lib/ui/components/badge";

import { DescriptionList } from ".";

const meta: Meta<DescriptionListProps> = {
	component: DescriptionList,
	args: {
		items: [
			{ label: "Name", value: "Test User" },
			{ label: "Email", value: "test@mail.com" },
			{ label: "Role", value: <Badge size="sm">user</Badge> },
			{ label: "Member since", value: "November 28, 2026" },
		],
	},
	decorators: [
		(Story) => (
			<div className="max-w-2xl">
				<Story />
			</div>
		),
	],
};

export default meta;

type DescriptionListStory = StoryObj<DescriptionListProps>;

export const Default: DescriptionListStory = {};
