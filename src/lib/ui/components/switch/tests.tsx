import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Switch } from ".";

describe("Switch", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Switch label="Dark mode" />);

		expect(container).toMatchSnapshot();
	});

	test("associates label with the input", () => {
		const { getByLabelText } = render(
			<Switch id="dark-mode" label="Dark mode" />,
		);

		const input = getByLabelText("Dark mode");

		expect(input.getAttribute("id")).toBe("dark-mode");
		expect((input as HTMLInputElement).type).toBe("checkbox");
	});

	test("toggles and forwards onChange", () => {
		const onChange = vi.fn();

		const { getByLabelText } = render(
			<Switch label="Notifications" onChange={onChange} />,
		);

		const input = getByLabelText("Notifications") as HTMLInputElement;

		fireEvent.click(input);

		expect(input.checked).toBe(true);
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	test("reflects controlled checked state", () => {
		const { getByLabelText } = render(
			<Switch checked label="Enabled" onChange={() => {}} />,
		);

		expect((getByLabelText("Enabled") as HTMLInputElement).checked).toBe(true);
	});

	test("sets aria-invalid and styles message when isError is true", () => {
		const { getByLabelText, getByText } = render(
			<Switch isError label="Agree" message="This field is required" />,
		);

		expect(getByLabelText("Agree").getAttribute("aria-invalid")).toBe("true");
		expect(getByText("This field is required").className).toContain(
			"text-danger",
		);
	});

	test("is disabled and does not call onChange when disabled", () => {
		const onChange = vi.fn();

		const { getByLabelText } = render(
			<Switch disabled label="Muted" onChange={onChange} />,
		);

		const input = getByLabelText("Muted") as HTMLInputElement;

		fireEvent.click(input);

		expect(onChange).not.toHaveBeenCalled();
		expect(input.disabled).toBe(true);
	});

	test("forwards ref to the input element", () => {
		const ref = createRef<HTMLInputElement>();

		render(<Switch label="Ref" ref={ref} />);

		expect(ref.current?.tagName).toBe("INPUT");
		expect(ref.current?.getAttribute("type")).toBe("checkbox");
	});

	test("renders message text when provided", () => {
		const { getByText } = render(
			<Switch label="Feature" message="Experimental feature" />,
		);

		expect(getByText("Experimental feature")).toBeTruthy();
	});
});
