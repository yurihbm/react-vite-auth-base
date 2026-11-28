import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";
import { getMeKey } from "@modules/users";

import { useVerifySignup } from ".";

const USER = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "John Doe",
	email: "john@doe.com",
	role: "user",
	created_at: 1_710_000_000,
	updated_at: 1_710_100_000,
};

describe("useVerifySignup", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the code and stores the created user as the current user", async () => {
		const setQueryDataSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
		const fetchMock = mockFetch({
			"POST /auth/signup/verify": jsonResponse(
				{ data: USER, message: "auth.signup.success" },
				201,
			),
		});

		const { result } = renderHook(() => useVerifySignup(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ code: "123456" });
		});

		const [call] = fetchMock.callsTo("POST /auth/signup/verify");
		expect(JSON.parse(String(call.init.body))).toEqual({ code: "123456" });
		expect(setQueryDataSpy).toHaveBeenCalledWith(
			[getMeKey],
			expect.objectContaining({
				uuid: USER.uuid,
				createdAt: "2024-03-09T16:00:00.000Z",
			}),
		);
	});
});
