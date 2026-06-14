import type { SelectOption } from "../option-list/types";

import { cleanup, fireEvent, render } from "@testing-library/react";
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
} from "vitest";

import { MultiSelect } from ".";
import { setupVirtualizerEnv } from "../option-list/test-support";

const OPTIONS: SelectOption[] = [
	{ label: "Cheese", value: "cheese" },
	{ label: "Pepperoni", value: "pepperoni" },
	{ label: "Mushroom", value: "mushroom" },
];

describe("MultiSelect", () => {
	let restoreVirtualizerEnv: () => void;

	beforeAll(() => {
		restoreVirtualizerEnv = setupVirtualizerEnv();
	});

	afterAll(() => {
		restoreVirtualizerEnv();
	});

	afterEach(() => {
		cleanup();
	});

	test("shows the placeholder when nothing is selected", () => {
		const { getByRole } = render(
			<MultiSelect
				options={OPTIONS}
				value={[]}
				onChange={() => {}}
				placeholder="Pick toppings"
			/>,
		);

		expect(getByRole("combobox").textContent).toContain("Pick toppings");
	});

	test("summarizes the selection as a count", () => {
		const { getByRole } = render(
			<MultiSelect
				options={OPTIONS}
				value={["cheese", "mushroom"]}
				onChange={() => {}}
			/>,
		);

		expect(getByRole("combobox").textContent).toContain("2 selected");
	});

	test("uses a custom countLabel", () => {
		const { getByRole } = render(
			<MultiSelect
				options={OPTIONS}
				value={["cheese"]}
				onChange={() => {}}
				countLabel={(n) => `${n} item(s)`}
			/>,
		);

		expect(getByRole("combobox").textContent).toContain("1 item(s)");
	});

	test("exposes the error state to assistive technology", () => {
		const { getByRole } = render(
			<MultiSelect options={OPTIONS} value={[]} onChange={() => {}} isError />,
		);

		expect(getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
	});

	test("adds a value on select and stays open", () => {
		const onChange = vi.fn();

		const { getByRole, getByText } = render(
			<MultiSelect options={OPTIONS} value={[]} onChange={onChange} />,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.click(getByText("Pepperoni"));

		expect(onChange).toHaveBeenCalledWith(["pepperoni"]);
		expect(getByRole("listbox")).not.toBeNull();
	});

	test("removes an already-selected value on select", () => {
		const onChange = vi.fn();

		const { getByRole, getByText } = render(
			<MultiSelect options={OPTIONS} value={["cheese"]} onChange={onChange} />,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.click(getByText("Cheese"));

		expect(onChange).toHaveBeenCalledWith([]);
	});

	test("does not exceed maxSelected", () => {
		const onChange = vi.fn();

		const { getByRole, getByText } = render(
			<MultiSelect
				options={OPTIONS}
				value={["cheese"]}
				onChange={onChange}
				maxSelected={1}
			/>,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.click(getByText("Pepperoni"));

		expect(onChange).not.toHaveBeenCalled();
	});

	test("filters options by the search query", () => {
		const { getByRole, getByText, queryByText } = render(
			<MultiSelect options={OPTIONS} value={[]} onChange={() => {}} />,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.change(getByRole("textbox"), { target: { value: "mush" } });

		expect(getByText("Mushroom")).not.toBeNull();
		expect(queryByText("Cheese")).toBeNull();
	});
});
