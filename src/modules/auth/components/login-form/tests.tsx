import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useLogin } from "@modules/auth/services";

import { LoginForm } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
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
});
