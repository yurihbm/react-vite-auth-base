import type { RadioOption } from "./types";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { RadioGroup } from ".";

const defaultItems: RadioOption[] = [
	{ value: "a", label: "Option A" },
	{ value: "b", label: "Option B" },
	{ value: "c", label: "Option C" },
];

describe("RadioGroup", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<RadioGroup name="example" items={defaultItems} label="Choose one" />,
		);

		expect(container).toMatchSnapshot();
	});

	test("renders one radio per item", () => {
		const { getAllByRole } = render(
			<RadioGroup name="example" items={defaultItems} />,
		);

		expect(getAllByRole("radio")).toHaveLength(3);
	});

	test("defaultValue checks the corresponding radio", () => {
		const { getByLabelText } = render(
			<RadioGroup name="example" items={defaultItems} defaultValue="b" />,
		);

		expect((getByLabelText("Option B") as HTMLInputElement).checked).toBe(true);
		expect((getByLabelText("Option A") as HTMLInputElement).checked).toBe(
			false,
		);
	});

	test("calls onChange with the value when a radio is clicked", () => {
		const onChange = vi.fn();

		const { getByLabelText } = render(
			<RadioGroup name="example" items={defaultItems} onChange={onChange} />,
		);

		fireEvent.click(getByLabelText("Option C"));

		expect(onChange).toHaveBeenCalledWith("c");
	});

	test("does not call onChange for a disabled option", () => {
		const onChange = vi.fn();
		const items: RadioOption[] = [
			{ value: "a", label: "Option A" },
			{ value: "b", label: "Option B", disabled: true },
		];

		const { getByLabelText } = render(
			<RadioGroup name="example" items={items} onChange={onChange} />,
		);

		const disabled = getByLabelText("Option B") as HTMLInputElement;

		expect(disabled.disabled).toBe(true);

		fireEvent.click(disabled);

		expect(onChange).not.toHaveBeenCalled();
	});

	test("sets aria-invalid on all inputs when isError is true", () => {
		const { getAllByRole } = render(
			<RadioGroup name="example" items={defaultItems} isError />,
		);

		for (const input of getAllByRole("radio")) {
			expect(input.getAttribute("aria-invalid")).toBe("true");
		}
	});

	test("renders the message text when provided", () => {
		const { getByText } = render(
			<RadioGroup
				name="example"
				items={defaultItems}
				message="Please select an option"
			/>,
		);

		expect(getByText("Please select an option")).toBeTruthy();
	});

	test("controlled value determines which radio is checked", () => {
		const { getByLabelText } = render(
			<RadioGroup
				name="example"
				items={defaultItems}
				value="a"
				onChange={() => {}}
			/>,
		);

		expect((getByLabelText("Option A") as HTMLInputElement).checked).toBe(true);
		expect((getByLabelText("Option C") as HTMLInputElement).checked).toBe(
			false,
		);
	});
});
