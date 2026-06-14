import type { SelectOption } from "@src/modules/shared/components/option-list/types";

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { useCombobox } from ".";

const OPTIONS: SelectOption[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Cherry", value: "cherry" },
];

export function Harness({ options }: { options: SelectOption[] }) {
	const { activeIndex, openDropdown, handleSearchKeyDown } = useCombobox({
		options,
		onSelect: () => {},
		closeOnSelect: true,
		onQueryReset: () => {},
	});

	return (
		<>
			<button type="button" onClick={openDropdown}>
				Open
			</button>
			<input aria-label="Search" onKeyDown={handleSearchKeyDown} />
			<output>{activeIndex}</output>
		</>
	);
}

describe("useCombobox", () => {
	test("ArrowUp wraps to the last option when none is active", () => {
		const { getByLabelText, getByText, rerender } = render(
			<Harness options={[]} />,
		);

		fireEvent.click(getByText("Open"));
		rerender(<Harness options={OPTIONS} />);
		fireEvent.keyDown(getByLabelText("Search"), { key: "ArrowUp" });

		expect(getByText("2")).not.toBeNull();
	});
});
