import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DividerProps } from ".";

import { Divider } from ".";

const meta: Meta<DividerProps> = {
	component: Divider,
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};

export default meta;

type DividerStory = StoryObj<DividerProps>;

export const Default: DividerStory = {};

export const WithLabel: DividerStory = {
	args: {
		label: "or",
	},
};
