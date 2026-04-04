import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { client } from "@src/lib/api";
import { createQueryClientWrapper } from "@src/lib/tests";

import { logoutKey, useLogout } from ".";

vi.mock("@src/lib/api", () => ({
	client: {
		post: vi.fn(),
	},
}));

describe("useLogout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("returns a mutation object", () => {
		const { result } = renderHook(() => useLogout(), {
			wrapper: createQueryClientWrapper(),
		});

		expect(result.current.mutate).toBeTypeOf("function");
		expect(result.current.mutateAsync).toBeTypeOf("function");
	});

	test("sends logout request to auth logout endpoint", async () => {
		vi.mocked(client.post).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.post>>,
		);

		const { result } = renderHook(() => useLogout(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync();
		});

		expect(client.post).toHaveBeenCalledWith("/auth/logout");
		expect(logoutKey).toBe("auth/logout");
	});

	test("invalidates queries after successful logout", async () => {
		const invalidateQueriesSpy = vi.spyOn(
			QueryClient.prototype,
			"invalidateQueries",
		);

		vi.mocked(client.post).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.post>>,
		);

		const { result } = renderHook(() => useLogout(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync();
		});

		expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
	});
});
