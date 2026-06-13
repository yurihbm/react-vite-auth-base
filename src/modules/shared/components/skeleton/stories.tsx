import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SkeletonProps } from ".";

import { Skeleton } from ".";

const meta: Meta<SkeletonProps> = {
	component: Skeleton,
	argTypes: {
		variant: {
			options: ["text", "rect", "circle"],
			control: {
				type: "select",
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="max-w-96">
				<Story />
			</div>
		),
	],
};

export default meta;

type SkeletonStory = StoryObj<SkeletonProps>;

export const Text: SkeletonStory = {};

export const Card: SkeletonStory = {
	render: () => (
		<div className="flex items-center gap-3">
			<Skeleton variant="circle" className="size-12" />
			<div className="flex flex-1 flex-col gap-2">
				<Skeleton className="w-2/3" />
				<Skeleton className="w-1/3" />
			</div>
		</div>
	),
};

export const Rectangle: SkeletonStory = {
	args: {
		variant: "rect",
		className: "h-32 w-full",
	},
};
