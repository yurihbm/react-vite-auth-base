import type { QueryClient } from "@tanstack/react-query";

import { redirect } from "@tanstack/react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { GET_ME_QUERY_OPTIONS } from "@modules/users";

import {
	privateRouteBeforeLoad,
	publicOnlyRouteBeforeLoad,
	requireRoleBeforeLoad,
} from "./index";

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

describe("requireRoleBeforeLoad", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	function createArgs(fetchQuery: ReturnType<typeof vi.fn>) {
		return {
			context: { queryClient: { fetchQuery } as unknown as QueryClient },
			location: { href: "/admin/users" },
		};
	}

	test("allows users with the required role", async () => {
		const fetchQuery = vi.fn().mockResolvedValueOnce({ role: "admin" });

		await expect(
			requireRoleBeforeLoad("admin")(createArgs(fetchQuery)),
		).resolves.toBeUndefined();

		expect(redirect).not.toHaveBeenCalled();
	});

	test("redirects users with another role to home", async () => {
		const fetchQuery = vi.fn().mockResolvedValueOnce({ role: "user" });
		const redirectResult = { reason: "forbidden" };

		vi.mocked(redirect).mockReturnValueOnce(
			redirectResult as unknown as ReturnType<typeof redirect>,
		);

		await expect(
			requireRoleBeforeLoad("admin")(createArgs(fetchQuery)),
		).rejects.toBe(redirectResult);

		expect(redirect).toHaveBeenCalledWith({ to: "/", replace: true });
	});

	test("redirects unauthenticated users to login", async () => {
		const fetchQuery = vi.fn().mockRejectedValueOnce(new Error("unauthorized"));
		const redirectResult = { reason: "not-authenticated" };

		vi.mocked(redirect).mockReturnValueOnce(
			redirectResult as unknown as ReturnType<typeof redirect>,
		);

		await expect(
			requireRoleBeforeLoad("admin")(createArgs(fetchQuery)),
		).rejects.toBe(redirectResult);

		expect(redirect).toHaveBeenCalledWith({
			to: "/login",
			search: { redirect: "/admin/users" },
			replace: true,
		});
	});
});
