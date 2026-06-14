import type { SelectOption } from "../option-list/types";

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
	vi,
} from "vitest";

import { Select } from ".";
import { setupVirtualizerEnv } from "../option-list/test-support";

const OPTIONS: SelectOption[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Cherry", value: "cherry" },
];

describe("Select", () => {
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
			<Select
				options={OPTIONS}
				value={null}
				onChange={() => {}}
				placeholder="Pick a fruit"
			/>,
		);

		expect(getByRole("combobox").textContent).toContain("Pick a fruit");
		expect(getByRole("combobox").getAttribute("aria-expanded")).toBe("false");
	});

	test("shows the selected option label", () => {
		const { getByRole } = render(
			<Select options={OPTIONS} value="banana" onChange={() => {}} />,
		);

		expect(getByRole("combobox").textContent).toContain("Banana");
	});

	test("opens the dropdown and lists options on click", () => {
		const { getByRole, getByText } = render(
			<Select options={OPTIONS} value={null} onChange={() => {}} />,
		);

		fireEvent.click(getByRole("combobox"));

		expect(getByRole("combobox").getAttribute("aria-expanded")).toBe("true");
		expect(getByRole("listbox")).not.toBeNull();
		expect(getByText("Apple")).not.toBeNull();
	});

	test("selects an option and closes", () => {
		const onChange = vi.fn();

		const { getByRole, getByText, queryByRole } = render(
			<Select options={OPTIONS} value={null} onChange={onChange} />,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.click(getByText("Cherry"));

		expect(onChange).toHaveBeenCalledWith("cherry");
		expect(queryByRole("listbox")).toBeNull();
	});

	test("filters options by the search query", () => {
		const { getByRole, getByText, queryByText } = render(
			<Select options={OPTIONS} value={null} onChange={() => {}} />,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.change(getByRole("textbox"), { target: { value: "ban" } });

		expect(getByText("Banana")).not.toBeNull();
		expect(queryByText("Apple")).toBeNull();
	});

	test("selects the active option with the keyboard", () => {
		const onChange = vi.fn();

		const { getByRole } = render(
			<Select options={OPTIONS} value={null} onChange={onChange} />,
		);

		fireEvent.click(getByRole("combobox"));
		const search = getByRole("textbox");

		// Active starts at index 0 (Apple); move down to Banana and select.
		fireEvent.keyDown(search, { key: "ArrowDown" });
		fireEvent.keyDown(search, { key: "Enter" });

		expect(onChange).toHaveBeenCalledWith("banana");
	});

	test("closes when Escape is pressed", () => {
		const { getByRole, queryByRole } = render(
			<Select options={OPTIONS} value={null} onChange={() => {}} />,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.keyDown(getByRole("textbox"), { key: "Escape" });

		expect(queryByRole("listbox")).toBeNull();
	});

	test("uses onSearch results in async mode", async () => {
		const onSearch = vi.fn(async (query: string) =>
			OPTIONS.filter((o) =>
				o.label.toLowerCase().includes(query.toLowerCase()),
			),
		);

		const { getByRole, getByText, queryByText } = render(
			<Select
				options={OPTIONS}
				value={null}
				onChange={() => {}}
				onSearch={onSearch}
			/>,
		);

		fireEvent.click(getByRole("combobox"));
		fireEvent.change(getByRole("textbox"), { target: { value: "cher" } });

		// Wait until the async "cher" results replace the initial list.
		await waitFor(() => {
			expect(queryByText("Apple")).toBeNull();
		});
		expect(getByText("Cherry")).not.toBeNull();
		expect(onSearch).toHaveBeenCalledWith("cher");
	});
});
