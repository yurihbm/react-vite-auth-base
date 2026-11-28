import type { SelectOption } from "@lib/ui/components/option-list/types";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useCombobox } from ".";

const OPTIONS: SelectOption[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Cherry", value: "cherry" },
];

interface HarnessProps {
	options: SelectOption[];
	onSelect?: (option: SelectOption) => void;
	onQueryReset?: () => void;
	closeOnSelect?: boolean;
	disabled?: boolean;
}

export function Harness({
	options,
	onSelect = () => {},
	onQueryReset = () => {},
	closeOnSelect = true,
	disabled,
}: HarnessProps) {
	const {
		open,
		activeIndex,
		rootRef,
		searchRef,
		openDropdown,
		handleTriggerKeyDown,
		handleSearchKeyDown,
		selectOption,
	} = useCombobox({
		options,
		onSelect,
		closeOnSelect,
		disabled,
		onQueryReset,
	});

	return (
		<>
			<div ref={rootRef}>
				<button
					type="button"
					onClick={openDropdown}
					onKeyDown={handleTriggerKeyDown}
				>
					Open
				</button>
				<input
					ref={searchRef}
					aria-label="Search"
					onKeyDown={handleSearchKeyDown}
				/>
				<button type="button" onClick={() => selectOption(options[0])}>
					Pick first
				</button>
			</div>
			<button type="button">Outside</button>
			<output aria-label="active">{activeIndex}</output>
			<output aria-label="open">{String(open)}</output>
		</>
	);
}

describe("useCombobox", () => {
	afterEach(() => {
		cleanup();
	});

	test("ArrowUp wraps to the last option when none is active", () => {
		const { getByLabelText, getByText, rerender } = render(
			<Harness options={[]} />,
		);

		fireEvent.click(getByText("Open"));
		rerender(<Harness options={OPTIONS} />);
		fireEvent.keyDown(getByLabelText("Search"), { key: "ArrowUp" });

		expect(getByLabelText("active").textContent).toBe("2");
	});

	test.each(["ArrowDown", "Enter", " "])(
		"%s on the trigger opens and focuses the search field",
		(key) => {
			const { getByText, getByLabelText } = render(
				<Harness options={OPTIONS} />,
			);

			fireEvent.keyDown(getByText("Open"), { key });

			expect(getByLabelText("open").textContent).toBe("true");
			expect(getByLabelText("active").textContent).toBe("0");
			expect(document.activeElement).toBe(getByLabelText("Search"));
		},
	);

	test("trigger keys do nothing when disabled", () => {
		const { getByText, getByLabelText } = render(
			<Harness disabled options={OPTIONS} />,
		);

		fireEvent.keyDown(getByText("Open"), { key: "ArrowDown" });
		fireEvent.click(getByText("Open"));

		expect(getByLabelText("open").textContent).toBe("false");
	});

	test("unrelated trigger keys leave it closed", () => {
		const { getByText, getByLabelText } = render(<Harness options={OPTIONS} />);

		fireEvent.keyDown(getByText("Open"), { key: "a" });

		expect(getByLabelText("open").textContent).toBe("false");
	});

	test("arrow keys skip disabled options and wrap around", () => {
		const options = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana", disabled: true },
			{ label: "Cherry", value: "cherry" },
		];
		const { getByText, getByLabelText } = render(<Harness options={options} />);
		const search = getByLabelText("Search");

		fireEvent.click(getByText("Open"));
		fireEvent.keyDown(search, { key: "ArrowDown" });
		expect(getByLabelText("active").textContent).toBe("2");

		fireEvent.keyDown(search, { key: "ArrowDown" });
		expect(getByLabelText("active").textContent).toBe("0");

		fireEvent.keyDown(search, { key: "ArrowUp" });
		expect(getByLabelText("active").textContent).toBe("2");
	});

	test("Enter selects the active option and closes, resetting the query", () => {
		const onSelect = vi.fn();
		const onQueryReset = vi.fn();
		const { getByText, getByLabelText } = render(
			<Harness
				options={OPTIONS}
				onSelect={onSelect}
				onQueryReset={onQueryReset}
			/>,
		);
		const search = getByLabelText("Search");

		fireEvent.click(getByText("Open"));
		fireEvent.keyDown(search, { key: "ArrowDown" });
		fireEvent.keyDown(search, { key: "Enter" });

		expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
		expect(getByLabelText("open").textContent).toBe("false");
		expect(onQueryReset).toHaveBeenCalledTimes(1);
	});

	test("stays open after selecting when closeOnSelect is false", () => {
		const onSelect = vi.fn();
		const { getByText, getByLabelText } = render(
			<Harness closeOnSelect={false} options={OPTIONS} onSelect={onSelect} />,
		);

		fireEvent.click(getByText("Open"));
		fireEvent.keyDown(getByLabelText("Search"), { key: "Enter" });

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(getByLabelText("open").textContent).toBe("true");
	});

	test("never selects a disabled option", () => {
		const onSelect = vi.fn();
		const { getByText } = render(
			<Harness
				options={[{ label: "Apple", value: "apple", disabled: true }]}
				onSelect={onSelect}
			/>,
		);

		fireEvent.click(getByText("Pick first"));

		expect(onSelect).not.toHaveBeenCalled();
	});

	test("Enter with no options does not select or throw", () => {
		const onSelect = vi.fn();
		const { getByText, getByLabelText } = render(
			<Harness options={[]} onSelect={onSelect} />,
		);

		fireEvent.click(getByText("Open"));
		fireEvent.keyDown(getByLabelText("Search"), { key: "Enter" });

		expect(onSelect).not.toHaveBeenCalled();
		expect(getByLabelText("active").textContent).toBe("-1");
	});

	test("Escape and Tab close the dropdown and reset the query", () => {
		for (const key of ["Escape", "Tab"]) {
			const onQueryReset = vi.fn();
			const { getByText, getByLabelText, unmount } = render(
				<Harness options={OPTIONS} onQueryReset={onQueryReset} />,
			);

			fireEvent.click(getByText("Open"));
			fireEvent.keyDown(getByLabelText("Search"), { key });

			expect(getByLabelText("open").textContent).toBe("false");
			expect(getByLabelText("active").textContent).toBe("-1");
			expect(onQueryReset).toHaveBeenCalledTimes(1);
			unmount();
		}
	});

	test("closes on a pointerdown outside, but not inside", () => {
		const onQueryReset = vi.fn();
		const { getByText, getByLabelText } = render(
			<Harness options={OPTIONS} onQueryReset={onQueryReset} />,
		);

		fireEvent.click(getByText("Open"));
		fireEvent.pointerDown(getByLabelText("Search"));
		expect(getByLabelText("open").textContent).toBe("true");

		fireEvent.pointerDown(getByText("Outside"));

		expect(getByLabelText("open").textContent).toBe("false");
		expect(onQueryReset).toHaveBeenCalledTimes(1);
	});

	test("clamps the active index when the filtered list shrinks", () => {
		const { getByText, getByLabelText, rerender } = render(
			<Harness options={OPTIONS} />,
		);
		const search = getByLabelText("Search");

		fireEvent.click(getByText("Open"));
		fireEvent.keyDown(search, { key: "ArrowUp" });
		expect(getByLabelText("active").textContent).toBe("2");

		rerender(<Harness options={OPTIONS.slice(0, 1)} />);
		expect(getByLabelText("active").textContent).toBe("0");

		rerender(<Harness options={[]} />);
		expect(getByLabelText("active").textContent).toBe("-1");
	});
});
