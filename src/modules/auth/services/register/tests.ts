import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { client } from "@src/lib/api";
import { createQueryClientWrapper } from "@src/lib/tests";

import { registerKey, useRegister } from ".";

vi.mock("@src/lib/api", () => ({
	client: {
		post: vi.fn(),
	},
}));

describe("useRegister", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("returns a mutation object", () => {
		const { result } = renderHook(() => useRegister(), {
			wrapper: createQueryClientWrapper(),
		});

		expect(result.current.mutate).toBeTypeOf("function");
		expect(result.current.mutateAsync).toBeTypeOf("function");
	});

	test("sends user data to users endpoint", async () => {
		vi.mocked(client.post).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.post>>,
		);

		const { result } = renderHook(() => useRegister(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				email: "john@doe.com",
				name: "John Doe",
				password: "secret",
			});
		});

		expect(client.post).toHaveBeenCalledWith("/users", {
			data: {
				email: "john@doe.com",
				name: "John Doe",
				password: "secret",
			},
		});
		expect(registerKey).toBe("auth/register");
	});

	test("invalidates queries after successful registration", async () => {
		const invalidateQueriesSpy = vi.spyOn(
			QueryClient.prototype,
			"invalidateQueries",
		);

		vi.mocked(client.post).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.post>>,
		);

		const { result } = renderHook(() => useRegister(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				email: "john@doe.com",
				name: "John Doe",
				password: "secret",
			});
		});

		expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1);
	});
});
