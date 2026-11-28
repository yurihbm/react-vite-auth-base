import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType } from "react";
import type { NavLinkProps } from ".";

import { NavLink } from ".";

const meta: Meta<NavLinkProps<"a">> = {
	component: NavLink,
	args: {
		children: "Users",
		href: "#users",
	},
	argTypes: {
		as: {
			table: {
				disable: true,
			},
		},
	},
};

export default meta;

type NavLinkStory<E extends ElementType = "a"> = StoryObj<NavLinkProps<E>>;

export const Default: NavLinkStory = {};

export const Current: NavLinkStory = {
	args: {
		"aria-current": "page",
	},
};
