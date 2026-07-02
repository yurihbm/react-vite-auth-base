import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef, RowSelectionState } from "./types";

import { useState } from "react";

import { Table } from ".";

type Person = {
	name: string;
	role: string;
	status: string;
};

const people: Person[] = [
	{ name: "Alice Johnson", role: "Engineer", status: "Active" },
	{ name: "Bob Smith", role: "Designer", status: "Active" },
	{ name: "Carol White", role: "Manager", status: "On leave" },
	{ name: "Dave Brown", role: "Engineer", status: "Active" },
];

const columns: ColumnDef<Person>[] = [
	{ accessorKey: "name", header: "Name" },
	{ accessorKey: "role", header: "Role" },
	{ accessorKey: "status", header: "Status" },
];

const meta: Meta<typeof Table<Person>> = {
	component: Table<Person>,
	decorators: [
		(Story) => (
			<div className="max-w-2xl">
				<Story />
			</div>
		),
	],
};

export default meta;

type TableStory = StoryObj<typeof Table<Person>>;

export const Default: TableStory = {
	args: {
		data: people,
		columns,
	},
};

export const Striped: TableStory = {
	args: {
		data: people,
		columns,
		striped: true,
	},
};

export const Bordered: TableStory = {
	args: {
		data: people,
		columns,
		bordered: true,
	},
};

export const StickyHeader: TableStory = {
	decorators: [
		(Story) => (
			<div className="h-40 max-w-2xl overflow-hidden">
				<Story />
			</div>
		),
	],
	args: {
		data: people,
		columns,
		sticky: true,
	},
};

export const WithCaptionAndFooter: TableStory = {
	args: {
		data: people,
		columns,
		caption: "Team members",
		footer: (
			<div className="flex items-center justify-center p-2">
				<p>{people.length} members</p>
			</div>
		),
	},
};

export const Empty: TableStory = {
	args: {
		data: [],
		columns,
	},
};

export const WithCustomEmptyState: TableStory = {
	args: {
		data: [],
		columns,
		emptyState: "No team members yet.",
	},
};

export const WithSingleSelect: TableStory = {
	render: function Render(args) {
		const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
		const selectedCount = Object.keys(rowSelection).length;

		return (
			<div className="flex flex-col gap-3">
				<p className="text-sm text-foreground-muted">
					{selectedCount} of {people.length} row(s) selected
				</p>
				<Table
					{...args}
					data={people}
					columns={columns}
					selectionMode="select"
					getRowId={(person) => person.name}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
				/>
			</div>
		);
	},
};

export const WithMultiSelect: TableStory = {
	render: function Render(args) {
		const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
		const selectedCount = Object.keys(rowSelection).length;

		return (
			<div className="flex flex-col gap-3">
				<p className="text-sm text-foreground-muted">
					{selectedCount} of {people.length} row(s) selected
				</p>
				<Table
					{...args}
					data={people}
					columns={columns}
					selectionMode="multi-select"
					getRowId={(person) => person.name}
					rowSelection={rowSelection}
					onRowSelectionChange={setRowSelection}
				/>
			</div>
		);
	},
};
