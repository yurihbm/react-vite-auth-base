import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { useChangePassword } from "@modules/users/services";

import { ChangePasswordForm } from ".";

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/users/services", () => ({
	useChangePassword: vi.fn(),
}));

describe("ChangePasswordForm", () => {
	const mutateMock = vi.fn();

	function mockMutation(state: Record<string, unknown> = {}) {
		vi.mocked(useChangePassword).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			isSuccess: false,
			error: null,
			...state,
		} as unknown as ReturnType<typeof useChangePassword>);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		mockMutation();
	});

	afterEach(() => {
		cleanup();
	});

	test("renders a password input of 8 to 64 characters", () => {
		render(<ChangePasswordForm />);

		const input = screen.getByLabelText(
			"changePasswordForm.input.password.label",
		);

		expect(input.getAttribute("type")).toBe("password");
		expect(input.getAttribute("minlength")).toBe("8");
		expect(input.getAttribute("maxlength")).toBe("64");
	});

	test("submits the new password", () => {
		render(<ChangePasswordForm />);

		fireEvent.change(
			screen.getByLabelText("changePasswordForm.input.password.label"),
			{ target: { value: "s3cret-pass" } },
		);
		fireEvent.click(
			screen.getByRole("button", { name: "changePasswordForm.submitButton" }),
		);

		expect(mutateMock).toHaveBeenCalledWith(
			{ newPassword: "s3cret-pass" },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);
	});

	test("shows a success message", () => {
		mockMutation({ isSuccess: true });
		render(<ChangePasswordForm />);

		expect(screen.getByText("changePasswordForm.success")).toBeDefined();
	});

	test("shows the API error", () => {
		mockMutation({
			error: new APIError("auth.stepUp.sessionRevoked", { status: 401 }),
		});
		render(<ChangePasswordForm />);

		expect(
			screen.getByText("translated:auth.stepUp.sessionRevoked"),
		).toBeDefined();
	});

	test("shows nothing when the step-up was cancelled", () => {
		mockMutation({ error: new StepUpCancelledError() });
		render(<ChangePasswordForm />);

		expect(screen.queryByText(/^translated:|^unknown$/)).toBeNull();
	});
});
