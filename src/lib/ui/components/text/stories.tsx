import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType } from "react";
import type { TextProps } from ".";

import { Text } from ".";

const meta: Meta<TextProps<"p">> = {
	component: Text,
	args: {
		children: "Manage your profile and how you sign in.",
	},
	argTypes: {
		as: {
			table: {
				disable: true,
			},
		},
		variant: {
			options: ["body", "muted", "caption", "label"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type TextStory<E extends ElementType = "p"> = StoryObj<TextProps<E>>;

export const Default: TextStory = {};

export const Variants: TextStory = {
	render: () => (
		<div className="flex flex-col gap-3">
			<Text>Body: the default for content.</Text>
			<Text variant="muted">Muted: supporting text under a heading.</Text>
			<Text variant="caption">Caption: small print and metadata.</Text>
			<Text variant="label">Label: names a value or a field.</Text>
		</div>
	),
};

export const Muted: TextStory = {
	args: {
		variant: "muted",
	},
};

export const Caption: TextStory = {
	args: {
		variant: "caption",
	},
};

export const Label: TextStory = {
	args: {
		variant: "label",
		children: "Email",
	},
};
