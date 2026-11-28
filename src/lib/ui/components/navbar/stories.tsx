import type { Meta, StoryObj } from "@storybook/react-vite";
import type { NavbarProps } from ".";

import { Button } from "@lib/ui/components/button";
import { NavLink } from "@lib/ui/components/nav-link";

import { Navbar } from ".";

const meta: Meta<NavbarProps> = {
	component: Navbar,
	args: {
		brand: <a href="#home">React Vite Auth Base</a>,
		navLabel: "Main",
		menuLabel: "Menu",
		children: (
			<>
				<NavLink aria-current="page" href="#home">
					Home
				</NavLink>
				<NavLink href="#users">Users</NavLink>
				<NavLink href="#audit-logs">Audit logs</NavLink>
			</>
		),
	},
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;

type NavbarStory = StoryObj<NavbarProps>;

export const Default: NavbarStory = {};

export const WithActions: NavbarStory = {
	args: {
		actions: (
			<Button size="sm" variant="outline">
				Account
			</Button>
		),
	},
};
