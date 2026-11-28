import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Checkbox } from ".";

describe("Checkbox", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Checkbox label="Subscribe" />);

		expect(container).toMatchSnapshot();
	});

	test("associates label with the input", () => {
		const { getByLabelText } = render(
			<Checkbox id="terms" label="Accept terms" />,
		);

		const input = getByLabelText("Accept terms");

		expect(input.getAttribute("id")).toBe("terms");
		expect((input as HTMLInputElement).type).toBe("checkbox");
	});

	test("toggles and forwards onChange", () => {
		const onChange = vi.fn();

		const { getByLabelText } = render(
			<Checkbox label="Notify me" onChange={onChange} />,
		);

		const input = getByLabelText("Notify me") as HTMLInputElement;

		fireEvent.click(input);

		expect(input.checked).toBe(true);
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	test("reflects controlled checked state", () => {
		const { getByLabelText } = render(
			<Checkbox checked label="Enabled" onChange={() => {}} />,
		);

		expect((getByLabelText("Enabled") as HTMLInputElement).checked).toBe(true);
	});

	test("sets the indeterminate property on the input", () => {
		const { getByLabelText } = render(
			<Checkbox indeterminate label="Select all" />,
		);

		expect(
			(getByLabelText("Select all") as HTMLInputElement).indeterminate,
		).toBe(true);
	});

	test("sets aria-invalid and styles message when isError is true", () => {
		const { getByLabelText, getByText } = render(
			<Checkbox isError label="Agree" message="Required" />,
		);

		expect(getByLabelText("Agree").getAttribute("aria-invalid")).toBe("true");
		expect(getByText("Required").className).toContain("text-danger");
	});

	test("forwards ref to the input element", () => {
		const ref = createRef<HTMLInputElement>();

		render(<Checkbox label="Ref" ref={ref} />);

		expect(ref.current?.tagName).toBe("INPUT");
		expect(ref.current?.getAttribute("type")).toBe("checkbox");
	});
});
