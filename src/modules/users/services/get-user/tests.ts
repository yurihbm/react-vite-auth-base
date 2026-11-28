import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { getUserKey, useGetUser } from ".";

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

describe("useGetUser", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("fetches a user by uuid", async () => {
		mockFetch({
			[`GET /users/${UUID}`]: jsonResponse({
				data: {
					uuid: UUID,
					name: "John Doe",
					email: "john@doe.com",
					role: "user",
					created_at: 1_710_000_000,
					updated_at: 1_710_100_000,
				},
				message: "ok",
			}),
		});

		const { result } = renderHook(() => useGetUser(UUID), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toMatchObject({ uuid: UUID, role: "user" });
		expect(getUserKey).toBe("users/get");
	});
});
