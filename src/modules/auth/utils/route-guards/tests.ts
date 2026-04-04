import type { QueryClient } from "@tanstack/react-query";

import { redirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { GET_ME_QUERY_OPTIONS } from "@src/modules/users";

import { privateRouteBeforeLoad, publicOnlyRouteBeforeLoad } from "./index";

vi.mock("@tanstack/react-router", () => ({
	redirect: vi.fn(),
}));

describe("publicOnlyRouteBeforeLoad", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("redirects authenticated users to home", async () => {
		const fetchQueryMock = vi.fn().mockResolvedValueOnce({
			id: "1",
			email: "john@doe.com",
		});
		const queryClient = {
			fetchQuery: fetchQueryMock,
		} as unknown as QueryClient;
		const redirectResult = { reason: "already-authenticated" };

		vi.mocked(redirect).mockReturnValueOnce(
			redirectResult as unknown as ReturnType<typeof redirect>,
		);

		await expect(
			publicOnlyRouteBeforeLoad({
				context: { queryClient },
			}),
		).rejects.toBe(redirectResult);

		expect(fetchQueryMock).toHaveBeenCalledWith(GET_ME_QUERY_OPTIONS);
		expect(redirect).toHaveBeenCalledWith({
			to: "/",
			replace: true,
		});
	});

	test("allows unauthenticated users", async () => {
		const fetchQueryMock = vi
			.fn()
			.mockRejectedValueOnce(new Error("unauthorized"));
		const queryClient = {
			fetchQuery: fetchQueryMock,
		} as unknown as QueryClient;

		await expect(
			publicOnlyRouteBeforeLoad({
				context: { queryClient },
			}),
		).resolves.toBeUndefined();

		expect(fetchQueryMock).toHaveBeenCalledWith(GET_ME_QUERY_OPTIONS);
		expect(redirect).not.toHaveBeenCalled();
	});
});

describe("privateRouteBeforeLoad", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("allows authenticated users", async () => {
		const fetchQueryMock = vi.fn().mockResolvedValueOnce({
			id: "1",
			email: "john@doe.com",
		});
		const queryClient = {
			fetchQuery: fetchQueryMock,
		} as unknown as QueryClient;

		await expect(
			privateRouteBeforeLoad({
				context: { queryClient },
				location: { href: "https://app.example/profile" },
			}),
		).resolves.toBeUndefined();

		expect(fetchQueryMock).toHaveBeenCalledWith(GET_ME_QUERY_OPTIONS);
		expect(redirect).not.toHaveBeenCalled();
	});

	test("redirects unauthenticated users to login", async () => {
		const fetchQueryMock = vi
			.fn()
			.mockRejectedValueOnce(new Error("unauthorized"));
		const queryClient = {
			fetchQuery: fetchQueryMock,
		} as unknown as QueryClient;
		const redirectResult = { reason: "not-authenticated" };

		vi.mocked(redirect).mockReturnValueOnce(
			redirectResult as unknown as ReturnType<typeof redirect>,
		);

		await expect(
			privateRouteBeforeLoad({
				context: { queryClient },
				location: { href: "https://app.example/settings" },
			}),
		).rejects.toBe(redirectResult);

		expect(fetchQueryMock).toHaveBeenCalledWith(GET_ME_QUERY_OPTIONS);
		expect(redirect).toHaveBeenCalledWith({
			to: "/login",
			search: {
				redirect: "https://app.example/settings",
			},
			replace: true,
		});
	});
});
