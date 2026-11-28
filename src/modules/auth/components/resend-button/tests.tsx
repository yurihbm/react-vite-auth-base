import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useResendSignup } from "@modules/auth/services";

import { ResendButton } from ".";

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth/services", () => ({
	useResendSignup: vi.fn(),
}));

describe("ResendButton", () => {
	const resendMutateMock = vi.fn();

	function mockResend(
		overrides: Partial<ReturnType<typeof useResendSignup>> = {},
	) {
		vi.mocked(useResendSignup).mockReturnValue({
			error: null,
			isPending: false,
			mutate: resendMutateMock,
			...overrides,
		} as unknown as ReturnType<typeof useResendSignup>);
	}

	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		mockResend();
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	test("requests a new code on click", () => {
		const { getByRole } = render(<ResendButton />);

		fireEvent.click(getByRole("button", { name: "resendButton.label" }));

		expect(resendMutateMock).toHaveBeenCalledWith(
			undefined,
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);
	});

	test("is disabled during a 60 second cooldown after a successful resend", () => {
		const { getByRole } = render(<ResendButton />);

		fireEvent.click(getByRole("button", { name: "resendButton.label" }));

		const [, handlers] = resendMutateMock.mock.calls[0] as [
			unknown,
			{ onSuccess: () => void },
		];

		act(() => {
			handlers.onSuccess();
		});

		const button = getByRole("button") as HTMLButtonElement;
		expect(button.disabled).toBe(true);

		act(() => {
			vi.advanceTimersByTime(59_000);
		});
		expect(button.disabled).toBe(true);

		act(() => {
			vi.advanceTimersByTime(1_000);
		});
		expect(button.disabled).toBe(false);
	});

	test("uses retryAfter from a rate limit error for the cooldown", () => {
		mockResend({
			error: new APIError("auth.email.sendLimit", {
				status: 429,
				retryAfter: 5,
			}),
		});

		const { getByRole } = render(<ResendButton />);
		const button = getByRole("button") as HTMLButtonElement;

		expect(button.disabled).toBe(true);

		act(() => {
			vi.advanceTimersByTime(5_000);
		});

		expect(button.disabled).toBe(false);
	});

	test("shows the translated API error", () => {
		mockResend({
			error: new APIError("auth.signup.noPending", { status: 401 }),
		});

		const { getByText } = render(<ResendButton />);

		expect(getByText("translated:auth.signup.noPending")).toBeDefined();
	});

	test("is disabled while the request is pending", () => {
		mockResend({ isPending: true });

		const { getByRole } = render(<ResendButton />);

		expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
	});
});
