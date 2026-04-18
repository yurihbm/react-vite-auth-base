import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@src/lib/api";

import { LoginForm } from ".";
import { useLogin } from "../../services";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("../../services", () => ({
	useLogin: vi.fn(),
}));

/**
 * Helper function to fill the login form and submit it.
 */
function fillFormAndSubmit(
	getByLabelText: ReturnType<typeof render>["getByLabelText"],
	getByRole: ReturnType<typeof render>["getByRole"],
) {
	fireEvent.change(getByLabelText("loginForm.input.email.label"), {
		target: { value: "john@doe.com" },
	});
	fireEvent.change(getByLabelText("loginForm.input.password.label"), {
		target: { value: "secret" },
	});
	fireEvent.click(getByRole("button", { name: "loginForm.submitButton" }));
}

describe("LoginForm", () => {
	const navigateMock = vi.fn();
	const loginMutateMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useLogin).mockReturnValue({
			isPending: false,
			mutate: loginMutateMock,
		} as unknown as ReturnType<typeof useLogin>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<LoginForm />);

		expect(container).toMatchSnapshot();
	});

	test("submits entered credentials through login mutation", () => {
		const { getByLabelText, getByRole } = render(<LoginForm />);

		const emailInput = getByLabelText("loginForm.input.email.label");
		const passwordInput = getByLabelText("loginForm.input.password.label");
		const submitButton = getByRole("button", {
			name: "loginForm.submitButton",
		});

		fireEvent.change(emailInput, { target: { value: "john@doe.com" } });
		fireEvent.change(passwordInput, { target: { value: "secret" } });
		fireEvent.click(submitButton);

		expect(loginMutateMock).toHaveBeenCalledWith(
			{
				email: "john@doe.com",
				password: "secret",
			},
			expect.objectContaining({
				onError: expect.any(Function),
				onSuccess: expect.any(Function),
			}),
		);
	});

	test("shows API error message from login failure", () => {
		const { getByLabelText, getByRole, getByText } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
			unknown,
			{
				onError: (error: unknown) => void;
			},
		];

		const apiErrorMessage = "auth.login.invalidCredentials";

		act(() => {
			handlers.onError(new APIError(apiErrorMessage));
		});

		expect(getByText(apiErrorMessage)).toBeDefined();
	});

	test("shows fallback message for unknown errors", () => {
		const { getByLabelText, getByRole, getByText } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
			unknown,
			{
				onError: (error: unknown) => void;
			},
		];

		act(() => {
			handlers.onError(new Error("boom"));
		});

		expect(getByText("loginForm.unexpectedError")).toBeDefined();
	});

	test("disables submit button while login is pending", () => {
		vi.mocked(useLogin).mockReturnValueOnce({
			isPending: true,
			mutate: loginMutateMock,
		} as unknown as ReturnType<typeof useLogin>);

		const { getByRole } = render(<LoginForm />);
		const submitButton = getByRole("button", {
			name: "loginForm.submitButton",
		});

		expect((submitButton as HTMLButtonElement).disabled).toBe(true);
	});

	test("navigates to home on successful login without provided redirectTo prop", () => {
		const { getByLabelText, getByRole } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
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

	test("navigates to provided redirectTo path on successful login", () => {
		const { getByLabelText, getByRole } = render(
			<LoginForm redirectTo="/dashboard" />,
		);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
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
