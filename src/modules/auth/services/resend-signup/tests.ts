import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { useResendSignup } from ".";

describe("useResendSignup", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts to the signup resend endpoint", async () => {
		const fetchMock = mockFetch({
			"POST /auth/signup/resend": jsonResponse(
				{ data: null, message: "auth.signup.codeResent" },
				202,
			),
		});

		const { result } = renderHook(() => useResendSignup(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync();
		});

		expect(fetchMock.callsTo("POST /auth/signup/resend")).toHaveLength(1);
	});
});
