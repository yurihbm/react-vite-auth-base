import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@src/lib/api";

import { RegisterForm } from ".";
import { useRegister } from "../../services";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("../../services", () => ({
	useRegister: vi.fn(),
}));

/**
 * Helper function to fill the register form and submit it.
 */
function fillFormAndSubmit(
	getByLabelText: ReturnType<typeof render>["getByLabelText"],
	getByRole: ReturnType<typeof render>["getByRole"],
) {
	fireEvent.change(getByLabelText("registerForm.input.email.label"), {
		target: { value: "john@doe.com" },
	});
	fireEvent.change(getByLabelText("registerForm.input.name.label"), {
		target: { value: "John Doe" },
	});
	fireEvent.change(getByLabelText("registerForm.input.password.label"), {
		target: { value: "secretpass" },
	});
	fireEvent.click(getByRole("button", { name: "registerForm.submitButton" }));
}

describe("RegisterForm", () => {
	const navigateMock = vi.fn();
	const registerMutateMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useRegister).mockReturnValue({
			isPending: false,
			mutate: registerMutateMock,
		} as unknown as ReturnType<typeof useRegister>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<RegisterForm />);

		expect(container).toMatchSnapshot();
	});

	test("submits entered data through register mutation", () => {
		const { getByLabelText, getByRole } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		expect(registerMutateMock).toHaveBeenCalledWith(
			{
				email: "john@doe.com",
				name: "John Doe",
				password: "secretpass",
			},
			expect.objectContaining({
				onError: expect.any(Function),
				onSuccess: expect.any(Function),
			}),
		);
	});

	test("shows API error message from register failure", () => {
		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			{
				onError: (error: unknown) => void;
			},
		];

		const apiErrorMessage = "auth.register.emailTaken";

		act(() => {
			handlers.onError(new APIError(apiErrorMessage));
		});

		expect(getByText(apiErrorMessage)).toBeDefined();
	});

	test("shows fallback message for unknown errors", () => {
		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			{
				onError: (error: unknown) => void;
			},
		];

		act(() => {
			handlers.onError(new Error("boom"));
		});

		expect(getByText("registerForm.unexpectedError")).toBeDefined();
	});

	test("disables submit button while register is pending", () => {
		vi.mocked(useRegister).mockReturnValueOnce({
			isPending: true,
			mutate: registerMutateMock,
		} as unknown as ReturnType<typeof useRegister>);

		const { getByRole } = render(<RegisterForm />);
		const submitButton = getByRole("button", {
			name: "registerForm.submitButton",
		});

		expect((submitButton as HTMLButtonElement).disabled).toBe(true);
	});

	test("navigates to home on successful register without provided redirectTo prop", () => {
		const { getByLabelText, getByRole } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			{
				onSuccess: () => void;
			},
		];

		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/",
		});
	});

	test("navigates to provided redirectTo path on successful register", () => {
		const { getByLabelText, getByRole } = render(
			<RegisterForm redirectTo="/dashboard" />,
		);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			{
				onSuccess: () => void;
			},
		];

		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/dashboard",
		});
	});
});
