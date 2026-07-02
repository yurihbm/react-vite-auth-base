import type { Meta, StoryObj } from "@storybook/react-vite";
import type { BreadcrumbProps } from ".";

import { Breadcrumb } from ".";

const meta: Meta<BreadcrumbProps> = {
	component: Breadcrumb,
};

export default meta;

type Story = StoryObj<BreadcrumbProps>;

export const Default: Story = {
	args: {
		items: [
			{ label: "Home", href: "/" },
			{ label: "Library", href: "/library" },
			{ label: "Data" },
		],
	},
};

export const WithCustomSeparator: Story = {
	args: {
		separator: ">",
		items: [
			{ label: "Home", href: "/" },
			{ label: "Library", href: "/library" },
			{ label: "Data" },
		],
	},
};

export const SingleItem: Story = {
	args: {
		items: [{ label: "Dashboard" }],
	},
};

export const WithOnClick: Story = {
	args: {
		items: [
			{ label: "Home", onClick: () => alert("Home clicked") },
			{ label: "Library", onClick: () => alert("Library clicked") },
			{ label: "Data" },
		],
	},
};

export const LongPath: Story = {
	args: {
		items: [
			{ label: "Home", href: "/" },
			{ label: "Library", href: "/library" },
			{ label: "Collections", href: "/library/collections" },
			{ label: "Datasets", href: "/library/collections/datasets" },
			{ label: "Reports", href: "/library/collections/datasets/reports" },
			{ label: "Q3 Summary" },
		],
	},
};
