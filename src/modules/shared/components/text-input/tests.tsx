import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { TextInput } from ".";

describe("TextInput", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<TextInput label="Username" placeholder="Enter your username" />,
		);

		expect(container).toMatchSnapshot();
	});

	test("associates provided id with label", () => {
		const { getByLabelText } = render(
			<TextInput id="email-input" label="Email" type="email" />,
		);

		const input = getByLabelText("Email");

		expect(input.getAttribute("id")).toBe("email-input");
		expect(input.getAttribute("type")).toBe("email");
	});

	test("forwards onChange and controlled value", () => {
		const onChange = vi.fn();

		const { getByRole } = render(
			<TextInput label="Username" onChange={onChange} value="john" />,
		);

		const input = getByRole("textbox", { name: "Username" });

		fireEvent.change(input, { target: { value: "jane" } });

		expect(input.getAttribute("value")).toBe("john");
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	test("forwards ref to the input element", () => {
		const ref = createRef<HTMLInputElement>();

		render(<TextInput label="Password" ref={ref} type="password" />);

		expect(ref.current?.tagName).toBe("INPUT");
		expect(ref.current?.getAttribute("type")).toBe("password");
	});

	test("renders start and end icons", () => {
		const { getByTestId } = render(
			<TextInput
				endIcon={<span data-testid="end-icon">E</span>}
				label="Search"
				startIcon={<span data-testid="start-icon">S</span>}
			/>,
		);

		expect(getByTestId("start-icon").textContent).toBe("S");
		expect(getByTestId("end-icon").textContent).toBe("E");
	});

	test("applies disabled state and disabled data attribute", () => {
		const { getByRole } = render(<TextInput disabled label="Username" />);

		const input = getByRole("textbox", { name: "Username" });
		const container = input.parentElement;

		expect((input as HTMLInputElement).disabled).toBe(true);
		expect(container?.getAttribute("data-disabled")).toBe("true");
	});

	test("sets aria-invalid when isError is true", () => {
		const { getByRole } = render(<TextInput isError label="Username" />);

		const input = getByRole("textbox", { name: "Username" });

		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	test("does not set aria-describedby when no description is provided", () => {
		const { getByRole } = render(<TextInput label="Username" />);

		const input = getByRole("textbox", { name: "Username" });

		expect(input.getAttribute("aria-describedby")).toBe(null);
	});

	test("merges external aria-describedby with message id", () => {
		const { getByRole, getByText } = render(
			<TextInput
				aria-describedby="username-hint"
				label="Username"
				message="Required"
			/>,
		);

		const input = getByRole("textbox", { name: "Username" });
		const message = getByText("Required");
		const describedBy = input.getAttribute("aria-describedby") || "";

		expect(message.getAttribute("id")).not.toBe(null);
		expect(describedBy).toContain("username-hint");
		expect(describedBy).toContain(message.getAttribute("id") as string);
	});

	test("applies variant and custom classes", () => {
		const { getByRole } = render(
			<TextInput
				classNames={{
					innerInput: "custom-inner",
					inputContainer: "custom-container",
				}}
				color="danger"
				label="Username"
				size="lg"
			/>,
		);

		const input = getByRole("textbox", { name: "Username" });
		const container = input.parentElement;

		expect(input.className).toContain("text-lg");
		expect(input.className).toContain("custom-inner");
		expect(container?.className).toContain("focus-within:border-danger");
		expect(container?.className).toContain("custom-container");
	});

	test("styles message as success when isSuccess is true", () => {
		const { getByText } = render(
			<TextInput isSuccess label="Username" message="Looks good" />,
		);

		const message = getByText("Looks good");

		expect(message.className).toContain("text-success");
	});
});
