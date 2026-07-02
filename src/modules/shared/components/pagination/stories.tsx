import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PaginationProps } from ".";

import { useState } from "react";

import { Pagination } from ".";

const meta: Meta<PaginationProps> = {
	component: Pagination,
	render: function Render(args) {
		const [page, setPage] = useState(args.page);

		return <Pagination {...args} page={page} onPageChange={setPage} />;
	},
};

export default meta;

type Story = StoryObj<PaginationProps>;

export const Default: Story = {
	args: {
		page: 3,
		totalPages: 10,
	},
};

export const FirstPage: Story = {
	args: {
		page: 1,
		totalPages: 10,
	},
};

export const LastPage: Story = {
	args: {
		page: 10,
		totalPages: 10,
	},
};

export const FewPages: Story = {
	args: {
		page: 1,
		totalPages: 3,
	},
};

export const SmallSize: Story = {
	args: {
		page: 3,
		totalPages: 10,
		size: "sm",
	},
};

export const NoEdgeButtons: Story = {
	args: {
		page: 3,
		totalPages: 10,
		showEdgeButtons: false,
	},
};

export const ManyPages: Story = {
	args: {
		page: 25,
		totalPages: 50,
	},
};
