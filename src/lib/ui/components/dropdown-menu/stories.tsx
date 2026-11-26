import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DropdownMenuProps } from ".";

import { DotsThreeIcon } from "@phosphor-icons/react";

import { DropdownMenu } from ".";
import { Button } from "../button";

const meta: Meta<DropdownMenuProps> = {
	component: DropdownMenu,
	decorators: [
		(Story) => (
			<div className="flex items-start justify-center p-16">
				<Story />
			</div>
		),
	],
};

export default meta;

type DropdownMenuStory = StoryObj<DropdownMenuProps>;

export const Default: DropdownMenuStory = {
	render: () => (
		<DropdownMenu>
			<DropdownMenu.Trigger asChild>
				<Button color="subtle">Options</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => {}}>Duplicate</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onSelect={() => {}} color="danger">
				Delete
			</DropdownMenu.Item>
		</DropdownMenu>
	),
};

export const IconTrigger: DropdownMenuStory = {
	render: () => (
		<DropdownMenu>
			<DropdownMenu.Trigger asChild>
				<Button color="subtle" aria-label="More options">
					<DotsThreeIcon size={20} weight="bold" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Item onSelect={() => {}}>View details</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => {}}>Export</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onSelect={() => {}} color="danger">
				Remove
			</DropdownMenu.Item>
		</DropdownMenu>
	),
};

export const WithDisabledItem: DropdownMenuStory = {
	render: () => (
		<DropdownMenu>
			<DropdownMenu.Trigger asChild>
				<Button color="subtle">Actions</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Item onSelect={() => {}}>Publish</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => {}} disabled>
				Archive (unavailable)
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onSelect={() => {}} color="danger">
				Delete
			</DropdownMenu.Item>
		</DropdownMenu>
	),
};
