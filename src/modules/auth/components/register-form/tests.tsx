import { useNavigate } from "@tanstack/react-router";
import {
	act,
	cleanup,
	fireEvent,
	render,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@src/lib/api";

import { RegisterForm } from ".";
import { useLogin, useRegister } from "../../services";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("../../services", () => ({
	useLogin: vi.fn(),
	useRegister: vi.fn(),
}));

function createDeferredPromise() {
	let resolve!: () => void;
	const promise = new Promise<void>((resolvePromise) => {
		resolve = resolvePromise;
	});

	return {
		promise,
		resolve,
	};
}

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
	const loginMutateAsyncMock = vi.fn();
	const registerMutateAsyncMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useLogin).mockReturnValue({
			isPending: false,
			mutateAsync: loginMutateAsyncMock,
		} as unknown as ReturnType<typeof useLogin>);
		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useRegister).mockReturnValue({
			isPending: false,
			mutateAsync: registerMutateAsyncMock,
		} as unknown as ReturnType<typeof useRegister>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<RegisterForm />);

		expect(container).toMatchSnapshot();
	});

	test("submits entered data through register mutation and auto-login", async () => {
		const { getByLabelText, getByRole } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		await waitFor(() => {
			expect(registerMutateAsyncMock).toHaveBeenCalledWith({
				email: "john@doe.com",
				name: "John Doe",
				password: "secretpass",
			});
		});

		await waitFor(() => {
			expect(loginMutateAsyncMock).toHaveBeenCalledWith({
				email: "john@doe.com",
				password: "secretpass",
			});
		});
	});

	test("shows API error message from register failure", async () => {
		const apiErrorMessage = "auth.register.emailTaken";

		registerMutateAsyncMock.mockRejectedValueOnce(
			new APIError(apiErrorMessage),
		);

		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		await waitFor(() => {
			expect(getByText(apiErrorMessage)).toBeDefined();
		});
	});

	test("shows API error message when auto-login fails", async () => {
		const apiErrorMessage = "auth.login.invalidCredentials";

		loginMutateAsyncMock.mockRejectedValueOnce(new APIError(apiErrorMessage));

		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		await waitFor(() => {
			expect(getByText(apiErrorMessage)).toBeDefined();
		});
	});

	test("shows fallback message for unknown errors", async () => {
		registerMutateAsyncMock.mockRejectedValueOnce(new Error("boom"));

		const { getByLabelText, getByRole, getByText } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		await waitFor(() => {
			expect(getByText("registerForm.unexpectedError")).toBeDefined();
		});
	});

	test("disables submit button while register is pending", () => {
		vi.mocked(useRegister).mockReturnValueOnce({
			isPending: true,
			mutateAsync: registerMutateAsyncMock,
		} as unknown as ReturnType<typeof useRegister>);

		const { getByRole } = render(<RegisterForm />);
		const submitButton = getByRole("button", {
			name: "registerForm.submitButton",
		});

		expect((submitButton as HTMLButtonElement).disabled).toBe(true);
	});

	test("disables submit button while auto-login is pending", () => {
		vi.mocked(useLogin).mockReturnValueOnce({
			isPending: true,
			mutateAsync: loginMutateAsyncMock,
		} as unknown as ReturnType<typeof useLogin>);

		const { getByRole } = render(<RegisterForm />);
		const submitButton = getByRole("button", {
			name: "registerForm.submitButton",
		});

		expect((submitButton as HTMLButtonElement).disabled).toBe(true);
	});

	test("navigates to home on successful register without provided redirectTo prop", async () => {
		const { getByLabelText, getByRole } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/",
			});
		});
	});

	test("waits for auto-login before navigating", async () => {
		const registerPromise = createDeferredPromise();
		const loginPromise = createDeferredPromise();

		registerMutateAsyncMock.mockReturnValueOnce(registerPromise.promise);
		loginMutateAsyncMock.mockReturnValueOnce(loginPromise.promise);

		const { getByLabelText, getByRole } = render(<RegisterForm />);

		fillFormAndSubmit(getByLabelText, getByRole);

		expect(navigateMock).not.toHaveBeenCalled();

		await act(async () => {
			registerPromise.resolve();
			await registerPromise.promise;
		});

		expect(loginMutateAsyncMock).toHaveBeenCalledWith({
			email: "john@doe.com",
			password: "secretpass",
		});
		expect(navigateMock).not.toHaveBeenCalled();

		await act(async () => {
			loginPromise.resolve();
			await loginPromise.promise;
		});

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/",
			});
		});
	});

	test("navigates to provided redirectTo path on successful register", async () => {
		const { getByLabelText, getByRole } = render(
			<RegisterForm redirectTo="/dashboard" />,
		);

		fillFormAndSubmit(getByLabelText, getByRole);

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/dashboard",
			});
		});
	});
});
