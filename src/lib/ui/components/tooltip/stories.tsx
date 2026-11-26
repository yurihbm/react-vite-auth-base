import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TooltipProps } from ".";

import { Tooltip } from ".";
import { Button } from "../button";

const meta: Meta<TooltipProps> = {
	component: Tooltip,
	args: {
		content: "Helpful description",
		side: "top",
	},
	argTypes: {
		side: {
			options: ["top", "right", "bottom", "left"],
			control: { type: "select" },
		},
	},
	decorators: [
		(Story) => (
			<div className="flex items-center justify-center p-16">
				<Story />
			</div>
		),
	],
};

export default meta;

type TooltipStory = StoryObj<TooltipProps>;

export const Default: TooltipStory = {
	args: {
		children: <Button>Hover me</Button>,
	},
};

export const Sides: TooltipStory = {
	render: () => (
		<div className="grid grid-cols-2 place-items-center gap-16 p-16">
			<Tooltip content="Top tooltip" side="top">
				<Button>Top</Button>
			</Tooltip>
			<Tooltip content="Right tooltip" side="right">
				<Button>Right</Button>
			</Tooltip>
			<Tooltip content="Bottom tooltip" side="bottom">
				<Button>Bottom</Button>
			</Tooltip>
			<Tooltip content="Left tooltip" side="left">
				<Button>Left</Button>
			</Tooltip>
		</div>
	),
};
