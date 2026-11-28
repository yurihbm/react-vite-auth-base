import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SpinnerProps } from ".";

import { Spinner } from ".";

const meta: Meta<SpinnerProps> = {
	component: Spinner,
	argTypes: {
		color: {
			options: [
				"primary",
				"secondary",
				"subtle",
				"info",
				"success",
				"warning",
				"danger",
			],
			control: {
				type: "select",
			},
		},
		size: {
			options: ["sm", "md", "lg"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type SpinnerStory = StoryObj<SpinnerProps>;

export const Default: SpinnerStory = {};

export const Sizes: SpinnerStory = {
	render: () => (
		<div className="flex items-center gap-4">
			<Spinner size="sm" />
			<Spinner size="md" />
			<Spinner size="lg" />
		</div>
	),
};

export const Danger: SpinnerStory = {
	args: {
		color: "danger",
		size: "lg",
	},
};
