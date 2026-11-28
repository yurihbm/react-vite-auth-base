import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { useResetPassword } from ".";

describe("useResetPassword", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the code and new password to the reset endpoint", async () => {
		const fetchMock = mockFetch({
			"POST /auth/password/reset": jsonResponse(
				{ data: null, message: "auth.passwordReset.success" },
				200,
			),
		});

		const { result } = renderHook(() => useResetPassword(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				code: "123456",
				password: "newsecret1",
			});
		});

		const [call] = fetchMock.callsTo("POST /auth/password/reset");
		expect(JSON.parse(String(call.init.body))).toEqual({
			code: "123456",
			password: "newsecret1",
		});
	});
});
