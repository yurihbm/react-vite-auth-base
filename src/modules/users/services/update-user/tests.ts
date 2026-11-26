import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";
import { getMeKey } from "@modules/users/services/get-me";
import { getUserKey } from "@modules/users/services/get-user";
import { listUsersKey } from "@modules/users/services/list-users";

import { updateUserKey, useUpdateUser } from ".";

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";
const USER = {
	uuid: UUID,
	name: "New Name",
	email: "john@doe.com",
	role: "user",
	created_at: 1_710_000_000,
	updated_at: 1_710_100_000,
};

describe("useUpdateUser", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("puts the name and updates the cached current user", async () => {
		const setQueryDataSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
		const fetchMock = mockFetch({
			[`PUT /users/${UUID}`]: jsonResponse({ data: USER, message: "ok" }),
		});

		const { result } = renderHook(() => useUpdateUser(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ uuid: UUID, name: "New Name" });
		});

		const [call] = fetchMock.callsTo(`PUT /users/${UUID}`);
		expect(JSON.parse(String(call.init.body))).toEqual({ name: "New Name" });
		expect(setQueryDataSpy).toHaveBeenCalledWith(
			[getMeKey],
			expect.any(Function),
		);
		expect(updateUserKey).toBe("users/update");
	});

	test("refreshes the cached user detail and the users list", async () => {
		const setQueryDataSpy = vi.spyOn(QueryClient.prototype, "setQueryData");
		const invalidateSpy = vi.spyOn(QueryClient.prototype, "invalidateQueries");
		mockFetch({
			[`PUT /users/${UUID}`]: jsonResponse({ data: USER, message: "ok" }),
		});

		const { result } = renderHook(() => useUpdateUser(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({ uuid: UUID, name: "New Name" });
		});

		expect(setQueryDataSpy).toHaveBeenCalledWith(
			[getUserKey, UUID],
			expect.objectContaining({ uuid: UUID, name: "New Name" }),
		);
		expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [listUsersKey] });
	});

	test("rejects with the API error key and details", async () => {
		mockFetch({
			[`PUT /users/${UUID}`]: jsonResponse(
				{
					error: "request.validation_failed",
					message: "x",
					details: { name: "too short" },
				},
				400,
			),
		});

		const { result } = renderHook(() => useUpdateUser(), {
			wrapper: createQueryClientWrapper(),
		});

		await expect(
			result.current.mutateAsync({ uuid: UUID, name: "a" }),
		).rejects.toMatchObject({ details: { name: "too short" } });
	});
});
