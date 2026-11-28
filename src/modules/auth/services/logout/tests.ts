import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { client } from "@lib/api";
import { createQueryClientWrapper } from "@lib/tests";
import { getMeKey, useGetMe } from "@modules/users";

import { logoutKey, useLogout } from ".";

vi.mock("@lib/api", () => ({
	client: {
		get: vi.fn(),
		post: vi.fn(),
	},
	request: vi.fn(),
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

	test("removes cached queries after successful logout", async () => {
		const removeQueriesSpy = vi.spyOn(QueryClient.prototype, "removeQueries");

		vi.mocked(client.post).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.post>>,
		);

		const { result } = renderHook(() => useLogout(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync();
		});

		expect(removeQueriesSpy).toHaveBeenCalledTimes(1);
	});

	test("signs the mounted user out without refetching it", async () => {
		vi.mocked(client.post).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.post>>,
		);
		const queryClient = new QueryClient();
		queryClient.setQueryData([getMeKey], {
			uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
			name: "John",
			email: "john@doe.com",
			role: "user" as const,
			createdAt: new Date(1000).toISOString(),
			updatedAt: new Date(1000).toISOString(),
		});
		queryClient.setQueryData(["users", "list"], ["private"]);

		// Like the root layout, which reads the user and logs out.
		const { result } = renderHook(
			() => ({ me: useGetMe(), logout: useLogout() }),
			{
				wrapper: ({ children }: PropsWithChildren) =>
					createElement(QueryClientProvider, { client: queryClient }, children),
			},
		);

		await act(async () => {
			await result.current.logout.mutateAsync();
		});

		await waitFor(() => expect(result.current.me.data).toBeUndefined());
		expect(
			queryClient
				.getQueryCache()
				.find({ queryKey: [getMeKey] })
				?.getObserversCount(),
		).toBe(1);
		expect(queryClient.getQueryData(["users", "list"])).toBeUndefined();
		expect(client.get).not.toHaveBeenCalled();
	});
});
