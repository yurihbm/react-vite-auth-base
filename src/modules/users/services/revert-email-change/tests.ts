import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { useRevertEmailChange } from ".";

describe("useRevertEmailChange", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the token and clears cached session state", async () => {
		const removeQueriesSpy = vi.spyOn(QueryClient.prototype, "removeQueries");
		const fetchMock = mockFetch({
			"POST /users/revert-email-change": jsonResponse({
				data: null,
				message: "user.emailChange.reverted",
			}),
		});

		const { result } = renderHook(() => useRevertEmailChange(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ token: "jwt-token" });
		});

		const [call] = fetchMock.callsTo("POST /users/revert-email-change");
		expect(JSON.parse(String(call.init.body))).toEqual({ token: "jwt-token" });
		expect(removeQueriesSpy).toHaveBeenCalledTimes(1);
	});
});
