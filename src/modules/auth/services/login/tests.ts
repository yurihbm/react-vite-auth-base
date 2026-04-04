import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { client } from "@src/lib/api";
import { createQueryClientWrapper } from "@src/lib/tests";

import { useLogin } from ".";

vi.mock("@src/lib/api", () => ({
	client: {
		post: vi.fn(),
	},
}));

describe("useLogin", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("returns a mutation object", () => {
		const { result } = renderHook(() => useLogin(), {
			wrapper: createQueryClientWrapper(),
		});

		expect(result.current.mutate).toBeTypeOf("function");
		expect(result.current.mutateAsync).toBeTypeOf("function");
	});

	test("sends credentials to auth login endpoint", async () => {
		vi.mocked(client.post).mockResolvedValueOnce(
			{} as Awaited<ReturnType<typeof client.post>>,
		);

		const { result } = renderHook(() => useLogin(), {
			wrapper: createQueryClientWrapper(),
		});

		await act(async () => {
			await result.current.mutateAsync({
				email: "john@doe.com",
				password: "secret",
			});
		});

		expect(client.post).toHaveBeenCalledWith("/auth/login", {
			data: {
				email: "john@doe.com",
				password: "secret",
			},
		});
	});
});
