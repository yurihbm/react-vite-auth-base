import type { SelectOption } from "./types";

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

import { OptionList } from ".";
import { setupVirtualizerEnv } from "./test-support";

const OPTIONS: SelectOption[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Grape", value: "grape", disabled: true },
];

describe("OptionList", () => {
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

	test("renders the empty message when there are no options", () => {
		const { getByText } = render(
			<OptionList
				options={[]}
				activeIndex={-1}
				getIsSelected={() => false}
				onSelect={() => {}}
				emptyMessage="Nothing here"
			/>,
		);

		expect(getByText("Nothing here")).not.toBeNull();
	});

	test("renders a listbox with option roles and selection state", () => {
		const { getByRole, getByText } = render(
			<OptionList
				options={OPTIONS}
				activeIndex={-1}
				getIsSelected={(option) => option.value === "apple"}
				onSelect={() => {}}
			/>,
		);

		expect(getByRole("listbox")).not.toBeNull();
		const apple = getByText("Apple").closest('[role="option"]');
		expect(apple?.getAttribute("aria-selected")).toBe("true");
	});

	test("calls onSelect when an enabled option is clicked", () => {
		const onSelect = vi.fn();

		const { getByText } = render(
			<OptionList
				options={OPTIONS}
				activeIndex={-1}
				getIsSelected={() => false}
				onSelect={onSelect}
			/>,
		);

		fireEvent.click(getByText("Banana"));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(
			expect.objectContaining({ value: "banana" }),
		);
	});

	test("does not call onSelect for disabled options", () => {
		const onSelect = vi.fn();

		const { getByText } = render(
			<OptionList
				options={OPTIONS}
				activeIndex={-1}
				getIsSelected={() => false}
				onSelect={onSelect}
			/>,
		);

		fireEvent.click(getByText("Grape"));

		expect(onSelect).not.toHaveBeenCalled();
	});

	test("renders checkboxes in multi mode", () => {
		const { container } = render(
			<OptionList
				multi
				options={OPTIONS}
				activeIndex={-1}
				getIsSelected={(option) => option.value === "apple"}
				onSelect={() => {}}
			/>,
		);

		const checkboxes = container.querySelectorAll('input[type="checkbox"]');
		expect(checkboxes.length).toBeGreaterThan(0);
		expect(
			container.querySelector('[aria-multiselectable="true"]'),
		).not.toBeNull();
	});
});
