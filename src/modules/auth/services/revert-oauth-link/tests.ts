import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { useRevertOAuthLink } from ".";

describe("useRevertOAuthLink", () => {
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
			"POST /auth/oauth/revert-link": jsonResponse({
				data: null,
				message: "auth.oauthLink.reverted",
			}),
		});

		const { result } = renderHook(() => useRevertOAuthLink(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ token: "jwt-token" });
		});

		const [call] = fetchMock.callsTo("POST /auth/oauth/revert-link");
		expect(JSON.parse(String(call.init.body))).toEqual({ token: "jwt-token" });
		expect(removeQueriesSpy).toHaveBeenCalledTimes(1);
	});
});
