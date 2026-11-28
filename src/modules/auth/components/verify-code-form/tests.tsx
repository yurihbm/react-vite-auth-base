import { useNavigate } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useVerifySignup } from "@modules/auth/services";

import { VerifyCodeForm } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth/components/resend-button", () => ({
	ResendButton: () => <button type="button">resend</button>,
}));

vi.mock("@modules/auth/services", () => ({
	useVerifySignup: vi.fn(),
}));

type Handlers = {
	onError: (error: unknown) => void;
	onSuccess: () => void;
};

function fillCodeAndSubmit(
	getByLabelText: ReturnType<typeof render>["getByLabelText"],
	getByRole: ReturnType<typeof render>["getByRole"],
) {
	fireEvent.change(getByLabelText("verifyCodeForm.input.code.label"), {
		target: { value: "123456" },
	});
	fireEvent.click(getByRole("button", { name: "verifyCodeForm.submitButton" }));
}

describe("VerifyCodeForm", () => {
	const navigateMock = vi.fn();
	const verifyMutateMock = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useVerifySignup).mockReturnValue({
			isPending: false,
			mutate: verifyMutateMock,
		} as unknown as ReturnType<typeof useVerifySignup>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<VerifyCodeForm />);

		expect(container).toMatchSnapshot();
	});

	test("renders a 6-digit numeric code input", () => {
		const { getByLabelText } = render(<VerifyCodeForm />);
		const input = getByLabelText("verifyCodeForm.input.code.label");

		expect(input.getAttribute("inputmode")).toBe("numeric");
		expect(input.getAttribute("maxlength")).toBe("6");
		expect(input.getAttribute("autocomplete")).toBe("one-time-code");
	});

	test("submits the code through the verify mutation", () => {
		const { getByLabelText, getByRole } = render(<VerifyCodeForm />);

		fillCodeAndSubmit(getByLabelText, getByRole);

		expect(verifyMutateMock).toHaveBeenCalledWith(
			{ code: "123456" },
			expect.objectContaining({
				onError: expect.any(Function),
				onSuccess: expect.any(Function),
			}),
		);
	});

	test("navigates to home on success by default", () => {
		const { getByLabelText, getByRole } = render(<VerifyCodeForm />);

		fillCodeAndSubmit(getByLabelText, getByRole);

		const [, handlers] = verifyMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
	});

	test("navigates to redirectTo on success", () => {
		const { getByLabelText, getByRole } = render(
			<VerifyCodeForm redirectTo="/dashboard" />,
		);

		fillCodeAndSubmit(getByLabelText, getByRole);

		const [, handlers] = verifyMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onSuccess();
		});

		expect(navigateMock).toHaveBeenCalledWith({ to: "/dashboard" });
	});

	test("calls onVerified before navigating on success", () => {
		const onVerified = vi.fn();
		const { getByLabelText, getByRole } = render(
			<VerifyCodeForm onVerified={onVerified} />,
		);

		fillCodeAndSubmit(getByLabelText, getByRole);

		const [, handlers] = verifyMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onSuccess();
		});

		expect(onVerified).toHaveBeenCalledTimes(1);
		expect(navigateMock).toHaveBeenCalled();
	});

	test("shows the translated API error", () => {
		const { getByLabelText, getByRole } = render(<VerifyCodeForm />);

		fillCodeAndSubmit(getByLabelText, getByRole);

		const [, handlers] = verifyMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(
				new APIError("auth.signup.invalidCode", { status: 401 }),
			);
		});

		expect(getByRole("alert").textContent).toContain(
			"translated:auth.signup.invalidCode",
		);
	});

	test("maps API error details onto the code input", () => {
		const { getByLabelText, getByRole, getByText } = render(<VerifyCodeForm />);

		fillCodeAndSubmit(getByLabelText, getByRole);

		const [, handlers] = verifyMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { code: "code must be numeric" },
				}),
			);
		});

		expect(getByText("code must be numeric")).toBeDefined();
	});

	test("disables submit after a rate limit error", () => {
		const { getByLabelText, getByRole } = render(<VerifyCodeForm />);

		fillCodeAndSubmit(getByLabelText, getByRole);

		const [, handlers] = verifyMutateMock.mock.calls[0] as [unknown, Handlers];
		act(() => {
			handlers.onError(new APIError("auth.email.codeLocked", { status: 429 }));
		});

		expect(
			(
				getByRole("button", {
					name: "verifyCodeForm.submitButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("disables submit while pending", () => {
		vi.mocked(useVerifySignup).mockReturnValueOnce({
			isPending: true,
			mutate: verifyMutateMock,
		} as unknown as ReturnType<typeof useVerifySignup>);

		const { getByRole } = render(<VerifyCodeForm />);

		expect(
			(
				getByRole("button", {
					name: "verifyCodeForm.submitButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("leaves the page description to the layout", () => {
		const { queryByText } = render(<VerifyCodeForm />);

		expect(queryByText("verifyCodeForm.description")).toBeNull();
	});

	test("focuses the first invalid field when the browser rejects the submit", () => {
		const { getByLabelText } = render(<VerifyCodeForm />);

		const input = getByLabelText("verifyCodeForm.input.code.label");

		act(() => {
			fireEvent.invalid(input);
		});

		expect(document.activeElement).toBe(input);
	});

	test("focuses the first field the API rejected", () => {
		const { getByLabelText, getByRole } = render(<VerifyCodeForm />);

		fillCodeAndSubmit(getByLabelText, getByRole);

		const [, handlers] = verifyMutateMock.mock.calls[0] as [
			unknown,
			{ onError: (error: unknown) => void },
		];

		act(() => {
			handlers.onError(
				new APIError("request.validation_failed", {
					status: 400,
					details: { code: "rejected" },
				}),
			);
		});

		expect(document.activeElement).toBe(
			getByLabelText("verifyCodeForm.input.code.label"),
		);
	});

	test.each([
		["", "verifyCodeForm.input.code.required"],
		["123", "verifyCodeForm.input.code.invalid"],
		["abcdef", "verifyCodeForm.input.code.invalid"],
	])("shows %j as %s on the code input", (value, message) => {
		const { getByLabelText, getByText } = render(<VerifyCodeForm />);
		const input = getByLabelText("verifyCodeForm.input.code.label");

		fireEvent.change(input, { target: { value } });
		act(() => {
			fireEvent.invalid(input);
		});

		expect(getByText(message)).toBeDefined();
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});
});
