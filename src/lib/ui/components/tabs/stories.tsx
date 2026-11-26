import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TabsProps } from ".";

import { Tabs } from ".";

const meta: Meta<TabsProps> = {
	component: Tabs,
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: { type: "select" },
		},
	},
};

export default meta;

type TabsStory = StoryObj<TabsProps>;

export const Default: TabsStory = {
	args: {
		defaultValue: "profile",
		items: [
			{
				value: "profile",
				label: "Profile",
				content: (
					<p className="text-sm text-foreground-muted">
						Manage your profile information.
					</p>
				),
			},
			{
				value: "security",
				label: "Security",
				content: (
					<p className="text-sm text-foreground-muted">
						Update your password and two-factor settings.
					</p>
				),
			},
			{
				value: "billing",
				label: "Billing",
				content: (
					<p className="text-sm text-foreground-muted">
						View invoices and manage your plan.
					</p>
				),
			},
		],
	},
};

export const WithDisabled: TabsStory = {
	args: {
		defaultValue: "profile",
		items: [
			{
				value: "profile",
				label: "Profile",
				content: (
					<p className="text-sm text-foreground-muted">Profile content.</p>
				),
			},
			{
				value: "security",
				label: "Security",
				content: (
					<p className="text-sm text-foreground-muted">Security content.</p>
				),
				disabled: true,
			},
			{
				value: "billing",
				label: "Billing",
				content: (
					<p className="text-sm text-foreground-muted">Billing content.</p>
				),
			},
		],
	},
};

export const Small: TabsStory = {
	args: {
		...Default.args,
		size: "sm",
	},
};
