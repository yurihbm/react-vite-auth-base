import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PopoverProps } from ".";

import { Popover } from ".";
import { Button } from "../button";
import { TextInput } from "../text-input";

const meta: Meta<PopoverProps> = {
	component: Popover,
	decorators: [
		(Story) => (
			<div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Popover>
			<Popover.Trigger asChild>
				<Button>Open popover</Button>
			</Popover.Trigger>
			<Popover.Content>
				<p>This is some popover content.</p>
			</Popover.Content>
		</Popover>
	),
};

export const WithForm: Story = {
	render: () => (
		<Popover>
			<Popover.Trigger asChild>
				<Button>Filter</Button>
			</Popover.Trigger>
			<Popover.Content>
				<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
					<TextInput label="Name" placeholder="Search by name" />
					<Button size="sm">Apply</Button>
				</div>
			</Popover.Content>
		</Popover>
	),
};

export const AsChildTrigger: Story = {
	render: () => (
		<Popover>
			<Popover.Trigger asChild>
				<button type="button">Custom trigger element</button>
			</Popover.Trigger>
			<Popover.Content>
				<p>Triggered from a plain button via asChild.</p>
			</Popover.Content>
		</Popover>
	),
};
