import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { logoutOthersKey, useLogoutOthers } from ".";

describe("useLogoutOthers", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts to the logout-others endpoint and accepts 204", async () => {
		const fetchMock = mockFetch({
			"POST /auth/logout-others": new Response(null, { status: 204 }),
		});

		const { result } = renderHook(() => useLogoutOthers(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync();
		});

		expect(fetchMock.callsTo("POST /auth/logout-others")).toHaveLength(1);
		expect(logoutOthersKey).toBe("auth/logout-others");
	});

	test("rejects with the API error key", async () => {
		mockFetch({
			"POST /auth/logout-others": jsonResponse(
				{ error: "auth.internalServerError", message: "x" },
				500,
			),
		});

		const { result } = renderHook(() => useLogoutOthers(), {
			wrapper: createQueryClientWrapper(),
		});

		await expect(result.current.mutateAsync()).rejects.toMatchObject({
			key: "auth.internalServerError",
		});
	});
});
