import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { useVerifyStepUp, verifyStepUpKey } from ".";

describe("useVerifyStepUp", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the code to the verify endpoint", async () => {
		const fetchMock = mockFetch({
			"POST /auth/step-up/verify": jsonResponse({
				data: { step_up_until: 1_710_000_000 },
				message: "auth.stepUp.verified",
			}),
		});

		const { result } = renderHook(() => useVerifyStepUp(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ code: "123456" });
		});

		const [call] = fetchMock.callsTo("POST /auth/step-up/verify");
		expect(JSON.parse(String(call.init.body))).toEqual({ code: "123456" });
		expect(verifyStepUpKey).toBe("auth/verify-step-up");
	});

	test("rejects with the API error key", async () => {
		mockFetch({
			"POST /auth/step-up/verify": jsonResponse(
				{ error: "auth.stepUp.invalidCode", message: "x" },
				401,
			),
		});

		const { result } = renderHook(() => useVerifyStepUp(), {
			wrapper: createQueryClientWrapper(),
		});

		await expect(
			result.current.mutateAsync({ code: "000000" }),
		).rejects.toMatchObject({ key: "auth.stepUp.invalidCode" });
	});
});
