import type { Meta, StoryObj } from "@storybook/react-vite";
import type { SettingRowProps } from ".";

import { Button } from "@lib/ui/components/button";

import { SettingRow } from ".";

const meta: Meta<SettingRowProps> = {
	component: SettingRow,
	args: {
		title: "Other devices",
		description: "Sign out of every device except this one.",
		children: (
			<Button className="self-end" variant="outline">
				Sign out other devices
			</Button>
		),
	},
};

export default meta;

type SettingRowStory = StoryObj<SettingRowProps>;

export const Default: SettingRowStory = {};

export const InAList: SettingRowStory = {
	render: (args) => (
		<div className="flex flex-col divide-y divide-border">
			<SettingRow {...args} title="Email" />
			<SettingRow {...args} title="Password" />
			<SettingRow {...args} />
		</div>
	),
};
