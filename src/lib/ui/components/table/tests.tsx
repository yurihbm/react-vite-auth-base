import type { TableProps } from ".";
import type { ColumnDef, RowSelectionState, SortingState } from "./types";

import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { useState } from "react";
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
} from "vitest";

import { setupVirtualizerEnv } from "@lib/ui/components/option-list/test-support";

import { Table } from ".";

type Person = { name: string; age: number };

const data: Person[] = [
	{ name: "Alice", age: 30 },
	{ name: "Bob", age: 25 },
	{ name: "Carol", age: 35 },
];

const columns: ColumnDef<Person>[] = [
	{ accessorKey: "name", header: "Name" },
	{ accessorKey: "age", header: "Age" },
];

describe("Table", () => {
	afterEach(() => cleanup());

	test("renders correctly", () => {
		const { container } = render(<Table data={data} columns={columns} />);
		expect(container).toMatchSnapshot();
	});

	test("renders column headers from columns prop", () => {
		const { getByRole } = render(<Table data={data} columns={columns} />);
		expect(getByRole("columnheader", { name: "Name" })).toBeTruthy();
		expect(getByRole("columnheader", { name: "Age" })).toBeTruthy();
	});

	test("renders a row per data item", () => {
		const { getAllByRole } = render(<Table data={data} columns={columns} />);
		// 1 header row + 3 data rows
		expect(getAllByRole("row")).toHaveLength(4);
	});

	test("renders cell values via accessorKey", () => {
		const { getByText } = render(<Table data={data} columns={columns} />);
		expect(getByText("Alice")).toBeTruthy();
		expect(getByText("30")).toBeTruthy();
	});

	test("renders caption when provided", () => {
		const { getByText } = render(
			<Table data={data} columns={columns} caption="People" />,
		);
		expect(getByText("People")).toBeTruthy();
	});

	test("renders footer as a single full-width row when provided", () => {
		const { getByText, container } = render(
			<Table data={data} columns={columns} footer="3 people" />,
		);
		expect(getByText("3 people")).toBeTruthy();
		const footerCell = container.querySelector("tfoot td");
		expect(footerCell?.getAttribute("colspan")).toBe("2");
	});

	test("does not render tfoot when footer is not provided", () => {
		const { container } = render(<Table data={data} columns={columns} />);
		expect(container.querySelector("tfoot")).toBeNull();
	});

	test("applies bordered class to table element", () => {
		const { container } = render(
			<Table data={data} columns={columns} bordered />,
		);
		expect(container.querySelector("table")?.className).toContain("border");
	});

	test("bordered cells only add a right divider, not a full outer border", () => {
		const { container } = render(
			<Table data={data} columns={columns} bordered />,
		);
		const cells = container.querySelectorAll("th, td");
		cells.forEach((cell) => {
			const classes = cell.className.split(/\s+/);
			expect(classes).toContain("border-r");
			expect(classes).not.toContain("border");
		});
	});

	test("bordered strips the right divider from the last column to avoid doubling the outer border", () => {
		const { container } = render(
			<Table data={data} columns={columns} bordered />,
		);
		expect(container.querySelector("table")?.className).toContain("border-r-0");
	});

	test("applies sticky class to thead element", () => {
		const { container } = render(
			<Table data={data} columns={columns} sticky />,
		);
		expect(container.querySelector("thead")?.className).toContain("sticky");
	});

	test("root wrapper clips to rounded corners and delegates scrolling to an inner scroll area", () => {
		const { container } = render(<Table data={data} columns={columns} />);
		const root = container.firstElementChild;
		const scrollArea = root?.firstElementChild;

		expect(root?.className).toContain("overflow-hidden");
		expect(root?.className).toContain("rounded-surface");
		expect(scrollArea?.className).toContain("overflow-auto");
		expect(scrollArea?.className).toContain("h-full");
	});

	test("applies striped class to body rows only", () => {
		const { container } = render(
			<Table data={data} columns={columns} striped />,
		);
		const headRow = container.querySelector("thead tr");
		const bodyRows = container.querySelectorAll("tbody tr");
		expect(headRow?.className).not.toContain("nth-child");
		bodyRows.forEach((row) => {
			expect(row.className).toContain("nth-child");
		});
	});

	test("renders default empty state when data is empty", () => {
		const { getByText } = render(<Table data={[]} columns={columns} />);
		expect(getByText("No data available.")).toBeTruthy();
	});

	test("renders custom empty state when provided", () => {
		const { getByText } = render(
			<Table data={[]} columns={columns} emptyState="Nothing here" />,
		);
		expect(getByText("Nothing here")).toBeTruthy();
	});

	test("does not render any checkboxes when selectionMode is none", () => {
		const { queryAllByRole } = render(<Table data={data} columns={columns} />);
		expect(queryAllByRole("checkbox")).toHaveLength(0);
	});
});

describe("Table selectionMode='select'", () => {
	afterEach(() => cleanup());

	test("renders one checkbox per row and no select-all checkbox", () => {
		const { getAllByRole, queryByLabelText } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="select"
				getRowId={(person) => person.name}
			/>,
		);
		expect(getAllByRole("checkbox")).toHaveLength(3);
		expect(queryByLabelText("Select all rows")).toBeNull();
	});

	test("selecting a row deselects the previously selected row", () => {
		const { getAllByRole } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="select"
				getRowId={(person) => person.name}
			/>,
		);
		const checkboxes = getAllByRole("checkbox") as HTMLInputElement[];

		fireEvent.click(checkboxes[0]);
		expect(checkboxes[0].checked).toBe(true);

		fireEvent.click(checkboxes[1]);
		expect(checkboxes[0].checked).toBe(false);
		expect(checkboxes[1].checked).toBe(true);
	});

	test("marks selected row with aria-selected", () => {
		const { getAllByRole } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="select"
				getRowId={(person) => person.name}
			/>,
		);
		const checkboxes = getAllByRole("checkbox");
		fireEvent.click(checkboxes[0]);

		const rows = getAllByRole("row");
		expect(rows[1].getAttribute("aria-selected")).toBe("true");
	});
});

describe("Table selectionMode='multi-select'", () => {
	afterEach(() => cleanup());

	test("renders a select-all checkbox plus one per row", () => {
		const { getAllByRole, getByLabelText } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="multi-select"
				getRowId={(person) => person.name}
			/>,
		);
		// 1 select-all + 3 row checkboxes
		expect(getAllByRole("checkbox")).toHaveLength(4);
		expect(getByLabelText("Select all rows")).toBeTruthy();
	});

	test("clicking select-all checks every row checkbox", () => {
		const { getAllByRole } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="multi-select"
				getRowId={(person) => person.name}
			/>,
		);
		const [selectAll] = getAllByRole("checkbox") as HTMLInputElement[];
		fireEvent.click(selectAll);

		const all = getAllByRole("checkbox") as HTMLInputElement[];
		expect(all.every((cb) => cb.checked)).toBe(true);
	});

	test("shows mixed state on select-all when only some rows are selected", () => {
		const { getAllByRole, getByLabelText } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="multi-select"
				getRowId={(person) => person.name}
			/>,
		);
		const checkboxes = getAllByRole("checkbox") as HTMLInputElement[];
		fireEvent.click(checkboxes[1]);

		expect(getByLabelText("Select all rows").getAttribute("aria-checked")).toBe(
			"mixed",
		);
	});

	test("renders exactly one icon in the select-all checkbox, swapping with state", () => {
		const { getByLabelText, getAllByRole } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="multi-select"
				getRowId={(person) => person.name}
			/>,
		);
		const selectAllBox = getByLabelText("Select all rows")
			.closest("span")
			?.querySelector('[aria-hidden="true"]');
		expect(selectAllBox?.querySelectorAll("svg")).toHaveLength(1);

		const checkboxes = getAllByRole("checkbox") as HTMLInputElement[];
		fireEvent.click(checkboxes[1]);

		const mixedBox = getByLabelText("Select all rows")
			.closest("span")
			?.querySelector('[aria-hidden="true"]');
		expect(mixedBox?.querySelectorAll("svg")).toHaveLength(1);
	});

	test("supports controlled rowSelection + onRowSelectionChange", () => {
		const onRowSelectionChange = vi.fn();

		function Controlled() {
			const [selection, setSelection] = useState<RowSelectionState>({});
			return (
				<Table
					data={data}
					columns={columns}
					selectionMode="multi-select"
					getRowId={(person) => person.name}
					rowSelection={selection}
					onRowSelectionChange={(next) => {
						setSelection(next);
						onRowSelectionChange(next);
					}}
				/>
			);
		}

		const { getAllByRole } = render(<Controlled />);
		const checkboxes = getAllByRole("checkbox") as HTMLInputElement[];
		fireEvent.click(checkboxes[1]);

		expect(onRowSelectionChange).toHaveBeenCalledTimes(1);
		expect(checkboxes[1].checked).toBe(true);
	});

	test("manages selection internally when uncontrolled", () => {
		const { getAllByRole } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="multi-select"
				getRowId={(person) => person.name}
			/>,
		);
		const checkboxes = getAllByRole("checkbox") as HTMLInputElement[];
		fireEvent.click(checkboxes[1]);
		expect(checkboxes[1].checked).toBe(true);
	});

	test("select-all deselects all when some rows are already selected", () => {
		const { getAllByRole } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="multi-select"
				getRowId={(person) => person.name}
			/>,
		);
		const checkboxes = getAllByRole("checkbox") as HTMLInputElement[];

		fireEvent.click(checkboxes[1]);
		expect(checkboxes[0].checked).toBe(false);

		fireEvent.click(checkboxes[0]);
		const allUnchecked = (getAllByRole("checkbox") as HTMLInputElement[]).every(
			(cb) => !cb.checked,
		);
		expect(allUnchecked).toBe(true);
	});

	test("select-all deselects all when every row is already selected", () => {
		const { getAllByRole } = render(
			<Table
				data={data}
				columns={columns}
				selectionMode="multi-select"
				getRowId={(person) => person.name}
			/>,
		);
		const [selectAll] = getAllByRole("checkbox") as HTMLInputElement[];

		fireEvent.click(selectAll);
		expect(selectAll.checked).toBe(true);

		fireEvent.click(selectAll);
		const allUnchecked = (getAllByRole("checkbox") as HTMLInputElement[]).every(
			(cb) => !cb.checked,
		);
		expect(allUnchecked).toBe(true);
	});
});

describe("Table selection type safety", () => {
	test("getRowId is required when selectionMode is 'select' or 'multi-select'", () => {
		// @ts-expect-error getRowId is required for selectionMode="select"
		const missingForSelect: TableProps<Person> = {
			data,
			columns,
			selectionMode: "select",
		};
		// @ts-expect-error getRowId is required for selectionMode="multi-select"
		const missingForMultiSelect: TableProps<Person> = {
			data,
			columns,
			selectionMode: "multi-select",
		};

		expect(missingForSelect).toBeTruthy();
		expect(missingForMultiSelect).toBeTruthy();
	});
});

describe("Table selection identity", () => {
	afterEach(() => cleanup());

	test("selection follows the record (via getRowId) when data is reordered", () => {
		function ReorderableTable() {
			const [rows, setRows] = useState(data);
			const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

			return (
				<>
					<button type="button" onClick={() => setRows([...rows].reverse())}>
						Reverse
					</button>
					<Table
						data={rows}
						columns={columns}
						selectionMode="multi-select"
						getRowId={(person) => person.name}
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
					/>
				</>
			);
		}

		const { getByRole, getAllByRole } = render(<ReorderableTable />);
		const checkboxes = getAllByRole("checkbox") as HTMLInputElement[];
		// select "Alice" (first row, index 1 among checkboxes since index 0 is select-all)
		fireEvent.click(checkboxes[1]);
		expect(checkboxes[1].checked).toBe(true);

		fireEvent.click(getByRole("button", { name: "Reverse" }));

		const rows = getAllByRole("row");
		// Alice is now the last data row; her checkbox must still be checked.
		const aliceRow = Array.from(rows).find((row) =>
			row.textContent?.includes("Alice"),
		);
		const aliceCheckbox = aliceRow?.querySelector(
			"input[type=checkbox]",
		) as HTMLInputElement | null;

		expect(aliceCheckbox?.checked).toBe(true);
	});
});

describe("Table sorting", () => {
	afterEach(() => cleanup());

	test("renders a sort trigger in headers for columns with an accessorKey", () => {
		render(<Table data={data} columns={columns} />);
		expect(screen.getAllByTestId("table-sort-button")).toHaveLength(2);
	});

	test("does not render a sort trigger for columns without an accessorKey", () => {
		const customColumns: ColumnDef<Person>[] = [
			{ id: "custom", header: "Custom", cell: () => "x" },
		];
		render(<Table data={data} columns={customColumns} />);
		const header = screen.getByRole("columnheader", { name: "Custom" });
		expect(within(header).queryByTestId("table-sort-button")).toBeNull();
		expect(header.getAttribute("aria-sort")).toBeNull();
	});

	test("clicking a sortable header cycles aria-sort: none -> ascending -> descending -> none", () => {
		render(<Table data={data} columns={columns} />);
		const header = screen.getByRole("columnheader", { name: "Name" });
		const sortButton = within(header).getByTestId("table-sort-button");

		expect(header.getAttribute("aria-sort")).toBe("none");

		fireEvent.click(sortButton);
		expect(header.getAttribute("aria-sort")).toBe("ascending");

		fireEvent.click(sortButton);
		expect(header.getAttribute("aria-sort")).toBe("descending");

		fireEvent.click(sortButton);
		expect(header.getAttribute("aria-sort")).toBe("none");
	});

	test("sorting ascending reorders rows by the sorted column", () => {
		render(<Table data={data} columns={columns} />);
		const header = screen.getByRole("columnheader", { name: "Name" });
		fireEvent.click(within(header).getByTestId("table-sort-button"));

		const rows = screen.getAllByRole("row").slice(1);
		expect(rows.map((row) => row.textContent)).toEqual([
			"Alice30",
			"Bob25",
			"Carol35",
		]);
	});

	test("always renders both caret-up and caret-down icons for sortable columns", () => {
		render(<Table data={data} columns={columns} />);
		const nameHeader = screen.getByRole("columnheader", { name: "Name" });

		expect(within(nameHeader).getByTestId("table-sort-icon-asc")).toBeTruthy();
		expect(within(nameHeader).getByTestId("table-sort-icon-desc")).toBeTruthy();
	});

	test("highlights only the caret icon matching the active sort direction", () => {
		render(<Table data={data} columns={columns} />);
		const nameHeader = screen.getByRole("columnheader", { name: "Name" });
		const ageHeader = screen.getByRole("columnheader", { name: "Age" });

		fireEvent.click(within(nameHeader).getByTestId("table-sort-button"));

		const nameUp = within(nameHeader).getByTestId("table-sort-icon-asc");
		const nameDown = within(nameHeader).getByTestId("table-sort-icon-desc");
		const ageUp = within(ageHeader).getByTestId("table-sort-icon-asc");
		const ageDown = within(ageHeader).getByTestId("table-sort-icon-desc");

		expect(nameUp.classList.contains("text-foreground")).toBe(true);
		expect(nameDown.classList.contains("text-foreground-subtle")).toBe(true);
		expect(ageUp.classList.contains("text-foreground-subtle")).toBe(true);
		expect(ageDown.classList.contains("text-foreground-subtle")).toBe(true);
	});

	test("supports controlled sorting + onSortingChange", () => {
		const onSortingChange = vi.fn();

		function Controlled() {
			const [sorting, setSorting] = useState<SortingState>([]);
			return (
				<Table
					data={data}
					columns={columns}
					sorting={sorting}
					onSortingChange={(next) => {
						setSorting(next);
						onSortingChange(next);
					}}
				/>
			);
		}

		render(<Controlled />);
		const header = screen.getByRole("columnheader", { name: "Name" });
		fireEvent.click(within(header).getByTestId("table-sort-button"));

		expect(onSortingChange).toHaveBeenCalledTimes(1);
		expect(header.getAttribute("aria-sort")).toBe("ascending");
	});

	test("manages sorting internally when uncontrolled", () => {
		render(<Table data={data} columns={columns} />);
		const header = screen.getByRole("columnheader", { name: "Name" });
		fireEvent.click(within(header).getByTestId("table-sort-button"));
		expect(header.getAttribute("aria-sort")).toBe("ascending");
	});

	describe("virtualized", () => {
		const manyPeople: Person[] = Array.from({ length: 200 }, (_, index) => ({
			name: `Person ${index}`,
			age: index,
		}));
		let restoreVirtualizerEnv: () => void;

		beforeAll(() => {
			restoreVirtualizerEnv = setupVirtualizerEnv();
		});

		afterAll(() => {
			restoreVirtualizerEnv();
		});

		test("renders only the rows near the viewport", () => {
			render(
				<Table
					data={manyPeople}
					columns={columns}
					virtualize={{ rowHeight: 40 }}
				/>,
			);

			expect(screen.getByText("Person 0")).toBeTruthy();
			expect(screen.queryByText("Person 150")).toBeNull();
		});

		test("calls onEndReached when the last row is within the window", () => {
			const onEndReached = vi.fn();
			render(
				<Table
					data={data}
					columns={columns}
					virtualize={{ rowHeight: 40, onEndReached }}
				/>,
			);

			expect(onEndReached).toHaveBeenCalled();
		});

		test("does not call onEndReached while the end is far away", () => {
			const onEndReached = vi.fn();
			render(
				<Table
					data={manyPeople}
					columns={columns}
					virtualize={{ rowHeight: 40, onEndReached }}
				/>,
			);

			expect(onEndReached).not.toHaveBeenCalled();
		});
	});
});
