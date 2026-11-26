import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { listUsersKey, useUsersList } from ".";

const USER = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "John Doe",
	email: "john@doe.com",
	role: "user",
	created_at: 1_710_000_000,
	updated_at: 1_710_100_000,
};
const OTHER_USER = { ...USER, uuid: "0b6f7c52-6f0c-4a52-9a43-0a3a1c2f6b22" };

describe("useUsersList", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("sends the filters in the query string and omits empty ones", async () => {
		const fetchMock = mockFetch({
			"GET /users": jsonResponse({
				data: [USER],
				message: "ok",
				meta: { total: 1, limit: 20 },
			}),
		});

		const { result } = renderHook(
			() => useUsersList({ search: "jo", role: "admin" }),
			{ wrapper: createQueryClientWrapper() },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		const [call] = fetchMock.callsTo("GET /users");
		expect(call.url.searchParams.get("search")).toBe("jo");
		expect(call.url.searchParams.get("role")).toBe("admin");
		expect(call.url.searchParams.has("cursor")).toBe(false);

		const { result: unfiltered } = renderHook(() => useUsersList({}), {
			wrapper: createQueryClientWrapper(),
		});
		await waitFor(() => expect(unfiltered.current.isSuccess).toBe(true));

		const calls = fetchMock.callsTo("GET /users");
		expect(calls[1].url.searchParams.has("search")).toBe(false);
		expect(calls[1].url.searchParams.has("role")).toBe(false);
	});

	test("maps users and exposes the total", async () => {
		mockFetch({
			"GET /users": jsonResponse({
				data: [USER],
				message: "ok",
				meta: { total: 42 },
			}),
		});

		const { result } = renderHook(() => useUsersList({}), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data?.pages[0].total).toBe(42);
		expect(result.current.data?.pages[0].users[0]).toMatchObject({
			uuid: USER.uuid,
			createdAt: new Date(USER.created_at * 1000).toISOString(),
		});
	});

	test("fetches the next page with the cursor until there is none", async () => {
		const fetchMock = mockFetch({
			"GET /users": [
				jsonResponse({
					data: [USER],
					message: "ok",
					meta: { total: 2, next_cursor: "abc" },
				}),
				jsonResponse({ data: [OTHER_USER], message: "ok", meta: { total: 2 } }),
			],
		});

		const { result } = renderHook(() => useUsersList({}), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => expect(result.current.hasNextPage).toBe(true));

		await act(async () => {
			await result.current.fetchNextPage();
		});
		await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

		const calls = fetchMock.callsTo("GET /users");
		expect(calls[1].url.searchParams.get("cursor")).toBe("abc");
		expect(result.current.data?.pages).toHaveLength(2);
		expect(result.current.hasNextPage).toBe(false);
		expect(listUsersKey).toBe("users/list");
	});

	test("rejects with the API error key", async () => {
		mockFetch({
			"GET /users": jsonResponse(
				{ error: "users.invalidCursor", message: "x" },
				400,
			),
		});

		const { result } = renderHook(() => useUsersList({}), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toMatchObject({ key: "users.invalidCursor" });
	});
});
