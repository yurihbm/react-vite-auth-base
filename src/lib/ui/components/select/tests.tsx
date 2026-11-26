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

const FRUITS: SelectOption[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Cherry", value: "cherry" },
];

const TOPPINGS: SelectOption[] = [
	{ label: "Cheese", value: "cheese" },
	{ label: "Pepperoni", value: "pepperoni" },
	{ label: "Mushroom", value: "mushroom" },
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

	describe("single mode", () => {
		test("shows the placeholder when nothing is selected", () => {
			const { getByRole } = render(
				<Select
					options={FRUITS}
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
				<Select options={FRUITS} value="banana" onChange={() => {}} />,
			);

			expect(getByRole("combobox").textContent).toContain("Banana");
		});

		test("exposes the error state to assistive technology", () => {
			const { getByRole } = render(
				<Select options={FRUITS} value={null} onChange={() => {}} isError />,
			);

			expect(getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
		});

		test("opens the dropdown and lists options on click", () => {
			const { getByRole, getByText } = render(
				<Select options={FRUITS} value={null} onChange={() => {}} />,
			);

			fireEvent.click(getByRole("combobox"));

			expect(getByRole("combobox").getAttribute("aria-expanded")).toBe("true");
			expect(getByRole("listbox")).not.toBeNull();
			expect(getByText("Apple")).not.toBeNull();
		});

		test("selects an option and closes", () => {
			const onChange = vi.fn();

			const { getByRole, getByText, queryByRole } = render(
				<Select options={FRUITS} value={null} onChange={onChange} />,
			);

			fireEvent.click(getByRole("combobox"));
			fireEvent.click(getByText("Cherry"));

			expect(onChange).toHaveBeenCalledWith("cherry");
			expect(queryByRole("listbox")).toBeNull();
		});

		test("filters options by the search query", () => {
			const { getByRole, getByText, queryByText } = render(
				<Select options={FRUITS} value={null} onChange={() => {}} />,
			);

			fireEvent.click(getByRole("combobox"));
			fireEvent.change(getByRole("textbox"), { target: { value: "ban" } });

			expect(getByText("Banana")).not.toBeNull();
			expect(queryByText("Apple")).toBeNull();
		});

		test("selects the active option with the keyboard", () => {
			const onChange = vi.fn();

			const { getByRole } = render(
				<Select options={FRUITS} value={null} onChange={onChange} />,
			);

			fireEvent.click(getByRole("combobox"));
			const search = getByRole("textbox");

			fireEvent.keyDown(search, { key: "ArrowDown" });
			fireEvent.keyDown(search, { key: "Enter" });

			expect(onChange).toHaveBeenCalledWith("banana");
		});

		test("closes when Escape is pressed", () => {
			const { getByRole, queryByRole } = render(
				<Select options={FRUITS} value={null} onChange={() => {}} />,
			);

			fireEvent.click(getByRole("combobox"));
			fireEvent.keyDown(getByRole("textbox"), { key: "Escape" });

			expect(queryByRole("listbox")).toBeNull();
		});

		test("uses onSearch results in async mode", async () => {
			const onSearch = vi.fn(async (query: string) =>
				FRUITS.filter((o) =>
					o.label.toLowerCase().includes(query.toLowerCase()),
				),
			);

			const { getByRole, getByText, queryByText } = render(
				<Select
					options={FRUITS}
					value={null}
					onChange={() => {}}
					onSearch={onSearch}
				/>,
			);

			fireEvent.click(getByRole("combobox"));
			fireEvent.change(getByRole("textbox"), { target: { value: "cher" } });

			await waitFor(() => {
				expect(queryByText("Apple")).toBeNull();
			});
			expect(getByText("Cherry")).not.toBeNull();
			expect(onSearch).toHaveBeenCalledWith("cher");
		});
	});

	describe("multi mode", () => {
		test("shows the placeholder when nothing is selected", () => {
			const { getByRole } = render(
				<Select
					isMulti
					options={TOPPINGS}
					value={[]}
					onChange={() => {}}
					placeholder="Pick toppings"
				/>,
			);

			expect(getByRole("combobox").textContent).toContain("Pick toppings");
		});

		test("summarizes the selection as a count", () => {
			const { getByRole } = render(
				<Select
					isMulti
					options={TOPPINGS}
					value={["cheese", "mushroom"]}
					onChange={() => {}}
				/>,
			);

			expect(getByRole("combobox").textContent).toContain("2 selected");
		});

		test("uses a custom countLabel", () => {
			const { getByRole } = render(
				<Select
					isMulti
					options={TOPPINGS}
					value={["cheese"]}
					onChange={() => {}}
					countLabel={(n) => `${n} item(s)`}
				/>,
			);

			expect(getByRole("combobox").textContent).toContain("1 item(s)");
		});

		test("exposes the error state to assistive technology", () => {
			const { getByRole } = render(
				<Select
					isMulti
					options={TOPPINGS}
					value={[]}
					onChange={() => {}}
					isError
				/>,
			);

			expect(getByRole("combobox").getAttribute("aria-invalid")).toBe("true");
		});

		test("adds a value on select and stays open", () => {
			const onChange = vi.fn();

			const { getByRole, getByText } = render(
				<Select isMulti options={TOPPINGS} value={[]} onChange={onChange} />,
			);

			fireEvent.click(getByRole("combobox"));
			fireEvent.click(getByText("Pepperoni"));

			expect(onChange).toHaveBeenCalledWith(["pepperoni"]);
			expect(getByRole("listbox")).not.toBeNull();
		});

		test("removes an already-selected value on select", () => {
			const onChange = vi.fn();

			const { getByRole, getByText } = render(
				<Select
					isMulti
					options={TOPPINGS}
					value={["cheese"]}
					onChange={onChange}
				/>,
			);

			fireEvent.click(getByRole("combobox"));
			fireEvent.click(getByText("Cheese"));

			expect(onChange).toHaveBeenCalledWith([]);
		});

		test("does not exceed maxSelected", () => {
			const onChange = vi.fn();

			const { getByRole, getByText } = render(
				<Select
					isMulti
					options={TOPPINGS}
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
				<Select isMulti options={TOPPINGS} value={[]} onChange={() => {}} />,
			);

			fireEvent.click(getByRole("combobox"));
			fireEvent.change(getByRole("textbox"), { target: { value: "mush" } });

			expect(getByText("Mushroom")).not.toBeNull();
			expect(queryByText("Cheese")).toBeNull();
		});
	});
});
