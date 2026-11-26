import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import {
	StepUpCancelledError,
	StepUpContext,
} from "@modules/auth/providers/step-up/context";

import { useStepUpMutation } from ".";

function setup(requestStepUp: () => Promise<void>) {
	return {
		wrapper: ({ children }: { children: React.ReactNode }) =>
			createElement(
				StepUpContext.Provider,
				{ value: { requestStepUp } },
				children,
			),
	};
}

const STEP_UP_REQUIRED = new APIError("auth.stepUp.required", {
	status: 403,
	key: "auth.stepUp.required",
});

describe("useStepUpMutation", () => {
	test("returns the result without asking for a step-up", async () => {
		const requestStepUp = vi.fn().mockResolvedValue(undefined);
		const fn = vi.fn().mockResolvedValue("ok");

		const { result } = renderHook(
			() => useStepUpMutation(fn),
			setup(requestStepUp),
		);

		await expect(result.current("vars")).resolves.toBe("ok");
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith("vars");
		expect(requestStepUp).not.toHaveBeenCalled();
	});

	test("requests a step-up on 403 auth.stepUp.required and retries once", async () => {
		const requestStepUp = vi.fn().mockResolvedValue(undefined);
		const fn = vi
			.fn()
			.mockRejectedValueOnce(STEP_UP_REQUIRED)
			.mockResolvedValueOnce("ok");

		const { result } = renderHook(
			() => useStepUpMutation(fn),
			setup(requestStepUp),
		);

		await expect(result.current("vars")).resolves.toBe("ok");
		expect(requestStepUp).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenLastCalledWith("vars");
	});

	test("does not retry other 403 errors", async () => {
		const requestStepUp = vi.fn().mockResolvedValue(undefined);
		const forbidden = new APIError("users.forbidden", {
			status: 403,
			key: "users.forbidden",
		});
		const fn = vi.fn().mockRejectedValue(forbidden);

		const { result } = renderHook(
			() => useStepUpMutation(fn),
			setup(requestStepUp),
		);

		await expect(result.current("vars")).rejects.toBe(forbidden);
		expect(requestStepUp).not.toHaveBeenCalled();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("rejects with the cancellation and does not retry", async () => {
		const requestStepUp = vi.fn().mockRejectedValue(new StepUpCancelledError());
		const fn = vi.fn().mockRejectedValue(STEP_UP_REQUIRED);

		const { result } = renderHook(
			() => useStepUpMutation(fn),
			setup(requestStepUp),
		);

		await expect(result.current("vars")).rejects.toBeInstanceOf(
			StepUpCancelledError,
		);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("surfaces the error of the retry without a second step-up", async () => {
		const requestStepUp = vi.fn().mockResolvedValue(undefined);
		const fn = vi.fn().mockRejectedValue(STEP_UP_REQUIRED);

		const { result } = renderHook(
			() => useStepUpMutation(fn),
			setup(requestStepUp),
		);

		await expect(result.current("vars")).rejects.toBe(STEP_UP_REQUIRED);
		expect(requestStepUp).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledTimes(2);
	});
});
