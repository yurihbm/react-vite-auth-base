import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { getMeKey, useGetMe } from ".";

describe("useGetMe", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("returns a query object", () => {
		mockFetch({ "GET /users/me": jsonResponse({ data: {}, message: "ok" }) });

		const { result } = renderHook(() => useGetMe(), {
			wrapper: createQueryClientWrapper(),
		});

		expect(result.current.refetch).toBeTypeOf("function");
		expect(result.current.status).toBe("pending");
	});

	test("fetches the current user and converts unix-second timestamps", async () => {
		mockFetch({
			"GET /users/me": jsonResponse({
				data: {
					uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
					name: "John Doe",
					email: "john@doe.com",
					role: "admin",
					created_at: 1_710_000_000,
					updated_at: 1_710_100_000,
				},
				message: "ok",
			}),
		});

		const { result } = renderHook(() => useGetMe(), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(result.current.data).toEqual({
			uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
			name: "John Doe",
			email: "john@doe.com",
			role: "admin",
			createdAt: new Date(1_710_000_000_000).toISOString(),
			updatedAt: new Date(1_710_100_000_000).toISOString(),
		});
		expect(getMeKey).toBe("users/me");
	});

	test("fails with client.invalidResponse when the payload is malformed", async () => {
		mockFetch({
			"GET /users/me": jsonResponse({
				data: { uuid: "not-a-uuid" },
				message: "ok",
			}),
		});

		const { result } = renderHook(() => useGetMe(), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isError).toBe(true);
		});

		expect(result.current.error).toMatchObject({
			key: "client.invalidResponse",
		});
	});
});
