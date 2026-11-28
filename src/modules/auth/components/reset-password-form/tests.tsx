import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useResetPassword } from "@modules/auth/services";

import { ResetPasswordForm } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth/services", () => ({
	useResetPassword: vi.fn(),
}));

type Handlers = {
	onError: (error: unknown) => void;
	onSuccess: () => void;
};

function fillAndSubmit(
	getByLabelText: ReturnType<typeof render>["getByLabelText"],
	getByRole: ReturnType<typeof render>["getByRole"],
) {
	fireEvent.change(getByLabelText("resetPasswordForm.input.code.label"), {
		target: { value: "123456" },
	});
	fireEvent.change(getByLabelText("resetPasswordForm.input.password.label"), {
		target: { value: "newsecret1" },
	});
	fireEvent.click(
		getByRole("button", { name: "resetPasswordForm.submitButton" }),
	);
}

describe("ResetPasswordForm", () => {
	const navigateMock = vi.fn();
	const resetMutateMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useResetPassword).mockReturnValue({
			isPending: false,
			mutate: resetMutateMock,
		} as unknown as ReturnType<typeof useResetPassword>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<ResetPasswordForm />);

		expect(container).toMatchSnapshot();
	});

	test("renders a 6-digit numeric code input", () => {
		const { getByLabelText } = render(<ResetPasswordForm />);
		const input = getByLabelText("resetPasswordForm.input.code.label");

		expect(input.getAttribute("inputmode")).toBe("numeric");
		expect(input.getAttribute("maxlength")).toBe("6");
	});

	test("submits the code and new password", () => {
		const { getByLabelText, getByRole } = render(<ResetPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		expect(resetMutateMock).toHaveBeenCalledWith(
			{ code: "123456", password: "newsecret1" },
			expect.objectContaining({
				onError: expect.any(Function),
				onSuccess: expect.any(Function),
			}),
		);
	});

	test("goes to login with the password reset reason on success", () => {
		const { getByLabelText, getByRole } = render(<ResetPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = resetMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/login",
			search: { redirect: "/", reason: "passwordReset" },
		});
	});

	test("shows the translated API error", () => {
		const { getByLabelText, getByRole } = render(<ResetPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = resetMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(
				new APIError("auth.passwordReset.invalidCode", { status: 401 }),
			);
		});

		expect(getByRole("alert").textContent).toContain(
			"translated:auth.passwordReset.invalidCode",
		);
	});

	test("maps API error details onto the matching inputs", () => {
		const { getByLabelText, getByRole, getByText } = render(
			<ResetPasswordForm />,
		);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = resetMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { password: "password is too long" },
				}),
			);
		});

		expect(getByText("password is too long")).toBeDefined();
	});

	test("disables submit after a rate limit error", () => {
		const { getByLabelText, getByRole } = render(<ResetPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = resetMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(new APIError("auth.email.codeLocked", { status: 429 }));
		});

		expect(
			(
				getByRole("button", {
					name: "resetPasswordForm.submitButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("leaves the page description to the layout", () => {
		const { queryByText } = render(<ResetPasswordForm />);

		expect(queryByText("resetPasswordForm.description")).toBeNull();
	});

	test("focuses the first invalid field when the browser rejects the submit", () => {
		const { getByLabelText } = render(<ResetPasswordForm />);

		const input = getByLabelText("resetPasswordForm.input.code.label");

		act(() => {
			fireEvent.invalid(input);
		});

		expect(document.activeElement).toBe(input);
	});

	test("focuses the first field the API rejected", () => {
		const { getByLabelText, getByRole } = render(<ResetPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = resetMutateMock.mock.calls[0] as [
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
			getByLabelText("resetPasswordForm.input.password.label"),
		);
	});
});
