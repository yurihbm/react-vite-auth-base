import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { useForgotPassword } from ".";

describe("useForgotPassword", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the email to the forgot password endpoint", async () => {
		const fetchMock = mockFetch({
			"POST /auth/password/forgot": jsonResponse(
				{ data: null, message: "auth.passwordReset.requested" },
				202,
			),
		});

		const { result } = renderHook(() => useForgotPassword(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ email: "john@doe.com" });
		});

		const [call] = fetchMock.callsTo("POST /auth/password/forgot");
		expect(JSON.parse(String(call.init.body))).toEqual({
			email: "john@doe.com",
		});
	});
});
