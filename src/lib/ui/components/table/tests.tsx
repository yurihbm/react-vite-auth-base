import type { TableProps } from ".";
import type { ColumnDef, RowSelectionState } from "./types";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

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
		expect(root?.className).toContain("rounded-lg");
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
