import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Textarea } from ".";

describe("Textarea", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<Textarea label="Bio" placeholder="Tell us about yourself" />,
		);

		expect(container).toMatchSnapshot();
	});

	test("associates label with the textarea", () => {
		const { getByLabelText } = render(<Textarea label="Label text" />);

		const textarea = getByLabelText("Label text");

		expect(textarea.tagName).toBe("TEXTAREA");
	});

	test("sets aria-invalid when isError is true", () => {
		const { getByRole } = render(<Textarea isError label="Bio" />);

		const textarea = getByRole("textbox", { name: "Bio" });

		expect(textarea.getAttribute("aria-invalid")).toBe("true");
	});

	test("links message via aria-describedby", () => {
		const { getByRole, getByText } = render(
			<Textarea label="Bio" message="Required" />,
		);

		const textarea = getByRole("textbox", { name: "Bio" });
		const message = getByText("Required");
		const describedBy = textarea.getAttribute("aria-describedby") || "";

		expect(message.getAttribute("id")).not.toBe(null);
		expect(describedBy).toContain(message.getAttribute("id") as string);
	});

	test("applies disabled state", () => {
		const { getByRole } = render(<Textarea disabled label="Bio" />);

		const textarea = getByRole("textbox", { name: "Bio" });

		expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
	});

	test("renders the message text", () => {
		const { getByText } = render(<Textarea label="Bio" message="Helper" />);

		expect(getByText("Helper").textContent).toBe("Helper");
	});

	test("displays and updates char count when typing", () => {
		const { getByRole, getByText } = render(
			<Textarea label="Bio" maxLength={200} />,
		);

		expect(getByText("0 / 200")).not.toBe(null);

		const textarea = getByRole("textbox", { name: "Bio" });

		fireEvent.change(textarea, { target: { value: "hello" } });

		expect(getByText("5 / 200")).not.toBe(null);
	});

	test("styles char count as danger when at maxLength", () => {
		const { getByText } = render(
			<Textarea label="Bio" maxLength={5} value="hello" />,
		);

		const charCount = getByText("5 / 5");

		expect(charCount.className).toContain("text-danger");
	});

	test("forwards ref to the textarea element", () => {
		const ref = createRef<HTMLTextAreaElement>();

		render(<Textarea label="Bio" ref={ref} />);

		expect(ref.current?.tagName).toBe("TEXTAREA");
	});

	test("initializes char count from defaultValue", () => {
		const { getByText } = render(
			<Textarea label="Bio" defaultValue="hello" maxLength={10} />,
		);

		expect(getByText("5 / 10")).not.toBe(null);
	});

	test("forwards onChange and controlled value", () => {
		const onChange = vi.fn();

		const { getByRole } = render(
			<Textarea label="Bio" onChange={onChange} value="john" />,
		);

		const textarea = getByRole("textbox", { name: "Bio" });

		fireEvent.change(textarea, { target: { value: "jane" } });

		expect((textarea as HTMLTextAreaElement).value).toBe("john");
		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
