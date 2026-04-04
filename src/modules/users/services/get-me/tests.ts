import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { client } from "@src/lib/api";
import { createQueryClientWrapper } from "@src/lib/tests";

import { getMeKey, useGetMe } from ".";

vi.mock("@src/lib/api", () => ({
	client: {
		get: vi.fn(),
	},
}));

describe("useGetMe", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("returns a query object", () => {
		vi.mocked(client.get).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.get>>,
		);

		const { result } = renderHook(() => useGetMe(), {
			wrapper: createQueryClientWrapper(),
		});

		expect(result.current.refetch).toBeTypeOf("function");
		expect(result.current.promise).toBeDefined();
	});

	test("fetches the current user and maps API fields", async () => {
		vi.mocked(client.get).mockResolvedValueOnce({
			data: {
				uuid: "user-1",
				name: "John Doe",
				email: "john@doe.com",
				role: "admin",
				created_at: 1_710_000_000_000,
				updated_at: 1_710_100_000_000,
			},
			message: "ok",
		} as Awaited<ReturnType<typeof client.get>>);

		const { result } = renderHook(() => useGetMe(), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isSuccess).toBe(true);
		});

		expect(client.get).toHaveBeenCalledWith("/users/me", {
			signal: expect.any(AbortSignal),
		});
		expect(result.current.data).toEqual({
			uuid: "user-1",
			name: "John Doe",
			email: "john@doe.com",
			role: "admin",
			createdAt: new Date(1_710_000_000_000).toISOString(),
			updatedAt: new Date(1_710_100_000_000).toISOString(),
		});
		expect(getMeKey).toBe("users/me");
	});
});
