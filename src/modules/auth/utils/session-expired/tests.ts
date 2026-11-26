import type { QueryClient } from "@tanstack/react-query";

import { describe, expect, test, vi } from "vitest";

import { handleSessionExpired } from ".";

function setup(routeIds: string[]) {
	const queryClient = { removeQueries: vi.fn() };
	const router = {
		state: {
			location: { href: "/account?tab=1" },
			matches: routeIds.map((routeId) => ({ routeId })),
		},
		navigate: vi.fn(),
	};

	handleSessionExpired(queryClient as unknown as QueryClient, router);

	return { queryClient, router };
}

describe("handleSessionExpired", () => {
	test("clears the query cache", () => {
		const { queryClient } = setup(["__root__", "/"]);

		expect(queryClient.removeQueries).toHaveBeenCalledTimes(1);
	});

	test("redirects to login when the current route is private", () => {
		const { router } = setup([
			"__root__",
			"/_authenticated",
			"/_authenticated/account/",
		]);

		expect(router.navigate).toHaveBeenCalledWith({
			to: "/login",
			search: { redirect: "/account?tab=1", reason: "expired" },
			replace: true,
		});
	});

	test("does not navigate when the current route is public", () => {
		const { router } = setup(["__root__", "/"]);

		expect(router.navigate).not.toHaveBeenCalled();
	});
});
