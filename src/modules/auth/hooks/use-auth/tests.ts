import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useGetMe } from "@src/modules/users";

import { useAuth } from ".";

vi.mock("@src/modules/users", () => ({
	useGetMe: vi.fn(),
}));

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useGetMe).mockReturnValue({
			data: null,
			isSuccess: false,
			isPending: false,
			isError: false,
		} as unknown as ReturnType<typeof useGetMe>);
	});

	test("returns pending unauthenticated state while user request is loading", () => {
		vi.mocked(useGetMe).mockReturnValueOnce({
			data: null,
			isSuccess: false,
			isPending: true,
			isError: false,
		} as unknown as ReturnType<typeof useGetMe>);

		const { result } = renderHook(() => useAuth());

		expect(result.current).toEqual({
			user: null,
			isPending: true,
			isAuthenticated: false,
		});
	});

	test("returns authenticated state when user query succeeds", () => {
		vi.mocked(useGetMe).mockReturnValueOnce({
			data: {
				uuid: "user-1",
				name: "John Doe",
				email: "john@doe.com",
				role: "admin",
				createdAt: new Date(1_710_000_000_000).toISOString(),
				updatedAt: new Date(1_710_100_000_000).toISOString(),
			},
			isSuccess: true,
			isPending: false,
			isError: false,
		} as unknown as ReturnType<typeof useGetMe>);

		const { result } = renderHook(() => useAuth());

		expect(result.current).toEqual({
			user: {
				uuid: "user-1",
				name: "John Doe",
				email: "john@doe.com",
				role: "admin",
				createdAt: new Date(1_710_000_000_000).toISOString(),
				updatedAt: new Date(1_710_100_000_000).toISOString(),
			},
			isPending: false,
			isAuthenticated: true,
		});
	});

	test("returns non-pending unauthenticated state when request fails", () => {
		vi.mocked(useGetMe).mockReturnValueOnce({
			data: null,
			isSuccess: false,
			isPending: false,
			isError: true,
		} as unknown as ReturnType<typeof useGetMe>);

		const { result } = renderHook(() => useAuth());

		expect(result.current).toEqual({
			user: null,
			isPending: false,
			isAuthenticated: false,
		});
	});

	test("returns unauthenticated idle state when there is no user", () => {
		const { result } = renderHook(() => useAuth());

		expect(result.current).toEqual({
			user: null,
			isPending: false,
			isAuthenticated: false,
		});
	});
});
