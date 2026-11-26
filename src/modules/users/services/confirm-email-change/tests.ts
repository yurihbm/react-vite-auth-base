import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { confirmEmailChangeKey, useConfirmEmailChange } from ".";

describe("useConfirmEmailChange", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the code and drops every cached query: all devices are signed out", async () => {
		const removeQueriesSpy = vi.spyOn(QueryClient.prototype, "removeQueries");
		const fetchMock = mockFetch({
			"POST /users/me/email/confirm": jsonResponse({
				data: {
					uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
					name: "John",
					email: "new@doe.com",
					role: "user",
					created_at: 1,
					updated_at: 2,
				},
				message: "user.emailChange.success",
			}),
		});

		const { result } = renderHook(() => useConfirmEmailChange(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ code: "123456" });
		});

		const [call] = fetchMock.callsTo("POST /users/me/email/confirm");
		expect(JSON.parse(String(call.init.body))).toEqual({ code: "123456" });
		expect(removeQueriesSpy).toHaveBeenCalled();
		expect(confirmEmailChangeKey).toBe("users/confirm-email-change");
	});

	test("rejects with the API error key", async () => {
		mockFetch({
			"POST /users/me/email/confirm": jsonResponse(
				{ error: "users.emailChange.invalidCode", message: "x" },
				401,
			),
		});

		const { result } = renderHook(() => useConfirmEmailChange(), {
			wrapper: createQueryClientWrapper(),
		});

		await expect(
			result.current.mutateAsync({ code: "000000" }),
		).rejects.toMatchObject({ key: "users.emailChange.invalidCode" });
	});
});
