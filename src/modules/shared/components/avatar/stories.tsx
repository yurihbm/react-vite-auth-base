import type { Meta, StoryObj } from "@storybook/react-vite";
import type { AvatarProps } from ".";

import { Avatar } from ".";

const meta: Meta<AvatarProps> = {
	component: Avatar,
	args: {
		name: "Ana Lima",
		size: "md",
	},
	argTypes: {
		size: {
			options: ["xs", "sm", "md", "lg", "xl"],
			control: { type: "select" },
		},
		color: {
			options: ["primary", "secondary", "info", "success", "warning", "danger"],
			control: { type: "select" },
		},
	},
};

export default meta;

type AvatarStory = StoryObj<AvatarProps>;

export const Initials: AvatarStory = {};

export const WithImage: AvatarStory = {
	args: {
		src: "https://i.pravatar.cc/150?img=47",
		alt: "Ana Lima",
	},
};

export const Sizes: AvatarStory = {
	render: (args) => (
		<div className="flex items-center gap-4">
			<Avatar {...args} size="xs" />
			<Avatar {...args} size="sm" />
			<Avatar {...args} size="md" />
			<Avatar {...args} size="lg" />
			<Avatar {...args} size="xl" />
		</div>
	),
};

export const Colors: AvatarStory = {
	render: (args) => (
		<div className="flex items-center gap-4">
			<Avatar {...args} name="Ana Lima" />
			<Avatar {...args} name="Bob Smith" />
			<Avatar {...args} name="Clara Dunn" />
			<Avatar {...args} name="David Park" />
			<Avatar {...args} name="Eva Müller" />
			<Avatar {...args} name="Frank Liu" />
		</div>
	),
};
