import type { ReactNode } from "react";

import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useLogin } from "@modules/auth/services";

import { LoginForm } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
	Link: ({ to, children }: { to: string; children: ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth/services", () => ({
	useLogin: vi.fn(),
}));

/** Helper function to fill the login form and submit it. */
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

		fillFormAndSubmit(getByLabelText, getByRole);

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

	test("shows the translated API error from login failure", () => {
		const { getByLabelText, getByRole, getByText } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
			unknown,
			{
				onError: (error: unknown) => void;
			},
		];

		act(() => {
			handlers.onError(
				new APIError("auth.authenticate.invalidCredentials", { status: 401 }),
			);
		});

		expect(
			getByText("translated:auth.authenticate.invalidCredentials"),
		).toBeDefined();
	});

	test("maps API error details onto the matching inputs", () => {
		const { getByLabelText, getByRole, getByText } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
			unknown,
			{
				onError: (error: unknown) => void;
			},
		];

		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { email: "email must be valid", password: "too short" },
				}),
			);
		});

		expect(getByText("email must be valid")).toBeDefined();
		expect(getByText("too short")).toBeDefined();
		expect(
			getByLabelText("loginForm.input.email.label").getAttribute(
				"aria-invalid",
			),
		).toBe("true");
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

	test("shows the server error in an alert", () => {
		const { getByLabelText, getByRole } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
			unknown,
			{ onError: (error: unknown) => void },
		];

		act(() => {
			handlers.onError(
				new APIError("auth.authenticate.invalidCredentials", { status: 401 }),
			);
		});

		expect(getByRole("alert").textContent).toContain(
			"translated:auth.authenticate.invalidCredentials",
		);
	});

	test("renders no alert before submitting", () => {
		const { queryByRole } = render(<LoginForm />);

		expect(queryByRole("alert")).toBeNull();
	});

	test("links to the forgot password page from the password label row", () => {
		const { getByRole } = render(<LoginForm />);

		const link = getByRole("link", { name: "loginPage.forgotPassword" });

		expect(link.getAttribute("href")).toBe("/password/forgot");
		expect(link.closest("label")).toBeNull();
	});

	test("focuses the first invalid field when the browser rejects the submit", () => {
		const { getByLabelText } = render(<LoginForm />);

		const input = getByLabelText("loginForm.input.email.label");

		act(() => {
			fireEvent.invalid(input);
		});

		expect(document.activeElement).toBe(input);
	});

	test("focuses the first field the API rejected", () => {
		const { getByLabelText, getByRole } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
			unknown,
			{ onError: (error: unknown) => void },
		];

		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { password: "rejected" },
				}),
			);
		});

		expect(document.activeElement).toBe(
			getByLabelText("loginForm.input.password.label"),
		);
	});

	test.each([
		["", "loginForm.input.email.required", "email"],
		["not-an-email", "loginForm.input.email.invalid", "email"],
		["a@b", "loginForm.input.email.tooShort", "email"],
		["", "loginForm.input.password.required", "password"],
	])("shows %j as %s on the %s input", (value, message, field) => {
		const { getByLabelText, getByText } = render(<LoginForm />);
		const input = getByLabelText(`loginForm.input.${field}.label`);

		fireEvent.change(input, { target: { value } });
		act(() => {
			fireEvent.invalid(input);
		});

		expect(getByText(message)).toBeDefined();
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	test("shows fallback message for unknown errors", () => {
		const { getByLabelText, getByRole, getByText } = render(<LoginForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = loginMutateMock.mock.calls[0] as [
			unknown,
			{ onError: (error: unknown) => void },
		];

		act(() => {
			handlers.onError(new Error("boom"));
		});

		expect(getByText("loginForm.unexpectedError")).toBeDefined();
	});
});
