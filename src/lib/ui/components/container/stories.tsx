import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ContainerProps } from ".";

import { Container } from ".";

const meta: Meta<ContainerProps> = {
	component: Container,
	args: {
		children: (
			<div className="rounded-control bg-background-muted p-4 text-sm">
				Page content
			</div>
		),
	},
	argTypes: {
		size: {
			options: ["narrow", "default", "wide"],
			control: {
				type: "select",
			},
		},
	},
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;

type ContainerStory = StoryObj<ContainerProps>;

export const Default: ContainerStory = {};

export const Narrow: ContainerStory = {
	args: {
		size: "narrow",
	},
};

export const Wide: ContainerStory = {
	args: {
		size: "wide",
	},
};
