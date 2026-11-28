import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";

import { StepUpDialog } from ".";

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

function renderDialog(props: Partial<Parameters<typeof StepUpDialog>[0]> = {}) {
	const handlers = {
		onSubmit: vi.fn(),
		onResend: vi.fn(),
		onCancel: vi.fn(),
	};

	render(
		<StepUpDialog
			open
			isSending={false}
			isVerifying={false}
			resendIn={0}
			{...handlers}
			{...props}
		/>,
	);

	return handlers;
}

function submitCode(code = "123456") {
	fireEvent.change(screen.getByLabelText("stepUpDialog.input.code.label"), {
		target: { value: code },
	});
	fireEvent.click(
		screen.getByRole("button", { name: "stepUpDialog.submitButton" }),
	);
}

describe("StepUpDialog", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders nothing when closed", () => {
		renderDialog({ open: false });

		expect(screen.queryByRole("dialog")).toBeNull();
	});

	test("renders a 6-digit numeric code input", () => {
		renderDialog();

		const input = screen.getByLabelText("stepUpDialog.input.code.label");

		expect(screen.getByRole("dialog")).toBeDefined();
		expect(input.getAttribute("inputmode")).toBe("numeric");
		expect(input.getAttribute("maxlength")).toBe("6");
		expect(input.getAttribute("autocomplete")).toBe("one-time-code");
	});

	test("submits the code", () => {
		const { onSubmit } = renderDialog();

		submitCode();

		expect(onSubmit).toHaveBeenCalledWith("123456");
	});

	test("cancels through the close button", () => {
		const { onCancel } = renderDialog();

		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	test("disables submit while verifying", () => {
		renderDialog({ isVerifying: true });

		expect(
			(
				screen.getByRole("button", {
					name: "stepUpDialog.submitButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("shows the verify error and maps its details onto the input", () => {
		renderDialog({
			verifyError: new APIError("auth.stepUp.invalidCode", {
				status: 401,
				details: { code: "code must be numeric" },
			}),
		});

		expect(
			screen.getByText("translated:auth.stepUp.invalidCode"),
		).toBeDefined();
		expect(
			screen
				.getByText("translated:auth.stepUp.invalidCode")
				.closest('[role="alert"]'),
		).not.toBeNull();
		expect(screen.getByText("code must be numeric")).toBeDefined();
	});

	test("shows a failure to send the code", () => {
		renderDialog({
			sendError: new APIError("auth.stepUp.sendFailed", { status: 500 }),
		});

		expect(screen.getByText("translated:auth.stepUp.sendFailed")).toBeDefined();
	});

	test("does not show the cooldown as an error: the code was already sent", () => {
		renderDialog({
			sendError: new APIError("auth.stepUp.cooldown", {
				status: 429,
				key: "auth.stepUp.cooldown",
			}),
		});

		expect(screen.queryByText("translated:auth.stepUp.cooldown")).toBeNull();
		expect(
			screen.getByLabelText("stepUpDialog.input.code.label"),
		).toBeDefined();
	});

	test("aborts with the message when the user is locked", () => {
		renderDialog({
			verifyError: new APIError("auth.stepUp.userLocked", {
				status: 429,
				key: "auth.stepUp.userLocked",
			}),
		});

		expect(screen.getByText("translated:auth.stepUp.userLocked")).toBeDefined();
		expect(screen.queryByLabelText("stepUpDialog.input.code.label")).toBeNull();
	});

	test("resends the code", () => {
		const { onResend } = renderDialog();

		fireEvent.click(screen.getByRole("button", { name: "resendButton.label" }));

		expect(onResend).toHaveBeenCalledTimes(1);
	});

	test("disables resend during the cooldown", () => {
		renderDialog({ resendIn: 42 });

		expect(
			(
				screen.getByRole("button", {
					name: "resendButton.cooldown",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});
});
