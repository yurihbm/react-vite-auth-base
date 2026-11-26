import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { requestStepUpKey, useRequestStepUp } from ".";

describe("useRequestStepUp", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts to the step-up endpoint and accepts 202", async () => {
		const fetchMock = mockFetch({
			"POST /auth/step-up": jsonResponse(
				{ message: "auth.stepUp.codeSent" },
				202,
			),
		});

		const { result } = renderHook(() => useRequestStepUp(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync();
		});

		expect(fetchMock.callsTo("POST /auth/step-up")).toHaveLength(1);
		expect(requestStepUpKey).toBe("auth/request-step-up");
	});

	test("rejects with the cooldown key", async () => {
		mockFetch({
			"POST /auth/step-up": jsonResponse(
				{ error: "auth.stepUp.cooldown", message: "x" },
				429,
			),
		});

		const { result } = renderHook(() => useRequestStepUp(), {
			wrapper: createQueryClientWrapper(),
		});

		await expect(result.current.mutateAsync()).rejects.toMatchObject({
			key: "auth.stepUp.cooldown",
			status: 429,
		});
	});
});
