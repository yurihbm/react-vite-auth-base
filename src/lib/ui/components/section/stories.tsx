import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SectionProps } from ".";

import { Text } from "@lib/ui/components/text";

import { Section } from ".";

const meta: Meta<SectionProps> = {
	component: Section,
	args: {
		title: "Profile",
		description: "Your name and email as other people see them.",
		children: <Text>Section content goes here.</Text>,
	},
	argTypes: {
		surface: {
			control: {
				type: "boolean",
			},
		},
	},
};

export default meta;

type SectionStory = StoryObj<SectionProps>;

export const Default: SectionStory = {};

export const Surface: SectionStory = {
	args: {
		surface: true,
	},
};

export const TitleOnly: SectionStory = {
	args: {
		description: undefined,
	},
};
