import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useRegister } from "@modules/auth/services";

import { RegisterForm } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth/services", () => ({
	useRegister: vi.fn(),
}));

type Handlers = {
	onError: (error: unknown) => void;
	onSuccess: () => void;
};

/** Helper function to fill the register form and submit it. */
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

	test("shows the translated API error from register failure", () => {
		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			Handlers,
		];

		act(() => {
			handlers.onError(new APIError("users.email.conflict", { status: 409 }));
		});

		expect(getByText("translated:users.email.conflict")).toBeDefined();
	});

	test("maps API error details onto the matching inputs", () => {
		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			Handlers,
		];

		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { password: "too weak" },
				}),
			);
		});

		expect(getByText("too weak")).toBeDefined();
		expect(
			getByLabelText("registerForm.input.password.label").getAttribute(
				"aria-invalid",
			),
		).toBe("true");
	});

	test("shows fallback message for unknown errors", () => {
		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			Handlers,
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

	test("disables submit button after a rate limit error", () => {
		const { getByLabelText, getByRole } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			Handlers,
		];

		act(() => {
			handlers.onError(
				new APIError("auth.email.sendLimit", { status: 429, retryAfter: 30 }),
			);
		});

		expect(
			(
				getByRole("button", {
					name: "registerForm.submitButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("goes to code verification without logging in, keeping the redirect", () => {
		const { getByLabelText, getByRole } = render(
			<RegisterForm redirectTo="/dashboard" />,
		);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			Handlers,
		];

		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/register/verify",
			search: { redirect: "/dashboard" },
		});
	});

	test("keeps the home redirect by default", () => {
		const { getByLabelText, getByRole } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		const [, handlers] = registerMutateMock.mock.calls[0] as [
			unknown,
			Handlers,
		];

		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/register/verify",
			search: { redirect: "/" },
		});
	});
});
