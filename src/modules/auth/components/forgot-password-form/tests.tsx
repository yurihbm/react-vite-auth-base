import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useForgotPassword } from "@modules/auth/services";

import { ForgotPasswordForm } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth/services", () => ({
	useForgotPassword: vi.fn(),
}));

type Handlers = {
	onError: (error: unknown) => void;
	onSuccess: () => void;
};

function fillAndSubmit(
	getByLabelText: ReturnType<typeof render>["getByLabelText"],
	getByRole: ReturnType<typeof render>["getByRole"],
) {
	fireEvent.change(getByLabelText("forgotPasswordForm.input.email.label"), {
		target: { value: "john@doe.com" },
	});
	fireEvent.click(
		getByRole("button", { name: "forgotPasswordForm.submitButton" }),
	);
}

describe("ForgotPasswordForm", () => {
	const navigateMock = vi.fn();
	const forgotMutateMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useForgotPassword).mockReturnValue({
			isPending: false,
			mutate: forgotMutateMock,
		} as unknown as ReturnType<typeof useForgotPassword>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<ForgotPasswordForm />);

		expect(container).toMatchSnapshot();
	});

	test("submits the email through the forgot password mutation", () => {
		const { getByLabelText, getByRole } = render(<ForgotPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		expect(forgotMutateMock).toHaveBeenCalledWith(
			{ email: "john@doe.com" },
			expect.objectContaining({
				onError: expect.any(Function),
				onSuccess: expect.any(Function),
			}),
		);
	});

	test("goes to the reset page on success", () => {
		const { getByLabelText, getByRole } = render(<ForgotPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = forgotMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({ to: "/password/reset" });
	});

	test("shows the translated API error", () => {
		const { getByLabelText, getByRole } = render(<ForgotPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = forgotMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(
				new APIError("auth.passwordReset.sendFailed", { status: 500 }),
			);
		});

		expect(getByRole("alert").textContent).toContain(
			"translated:auth.passwordReset.sendFailed",
		);
	});

	test("maps API error details onto the email input", () => {
		const { getByLabelText, getByRole, getByText } = render(
			<ForgotPasswordForm />,
		);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = forgotMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { email: "email must be valid" },
				}),
			);
		});

		expect(getByText("email must be valid")).toBeDefined();
	});

	test("disables submit after a rate limit error", () => {
		const { getByLabelText, getByRole } = render(<ForgotPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = forgotMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(new APIError("auth.email.sendLimit", { status: 429 }));
		});

		expect(
			(
				getByRole("button", {
					name: "forgotPasswordForm.submitButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("leaves the page description to the layout", () => {
		const { queryByText } = render(<ForgotPasswordForm />);

		expect(queryByText("forgotPasswordForm.description")).toBeNull();
	});

	test("focuses the first invalid field when the browser rejects the submit", () => {
		const { getByLabelText } = render(<ForgotPasswordForm />);

		const input = getByLabelText("forgotPasswordForm.input.email.label");

		act(() => {
			fireEvent.invalid(input);
		});

		expect(document.activeElement).toBe(input);
	});

	test("focuses the first field the API rejected", () => {
		const { getByLabelText, getByRole } = render(<ForgotPasswordForm />);

		fillAndSubmit(getByLabelText, getByRole);

		const [, handlers] = forgotMutateMock.mock.calls[0] as [
			unknown,
			{ onError: (error: unknown) => void },
		];

		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { email: "rejected" },
				}),
			);
		});

		expect(document.activeElement).toBe(
			getByLabelText("forgotPasswordForm.input.email.label"),
		);
	});
});
