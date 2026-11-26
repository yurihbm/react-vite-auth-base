import type { QueryClient } from "@tanstack/react-query";

import { describe, expect, test, vi } from "vitest";

import { handleSessionExpired } from ".";

const PRIVATE_ROUTES = [
	"__root__",
	"/_authenticated",
	"/_authenticated/account/",
];
const PUBLIC_ROUTES = ["__root__", "/"];

interface SetupOptions {
	/** Route ids matched by the last committed location. */
	resolvedRouteIds?: string[];
	/** Pathname of the latest (possibly pending) location. */
	latestPathname?: string;
	/** Whether a location was ever committed. */
	resolved?: boolean;
}

function setup({
	resolvedRouteIds = PRIVATE_ROUTES,
	latestPathname = "/account",
	resolved = true,
}: SetupOptions = {}) {
	const queryClient = { removeQueries: vi.fn() };
	const router = {
		latestLocation: { pathname: latestPathname },
		state: {
			resolvedLocation: resolved
				? { pathname: "/account", href: "/account?tab=1" }
				: undefined,
		},
		getMatchedRoutes: vi.fn(
			() => [resolvedRouteIds.map((id) => ({ id }))] as const,
		),
		navigate: vi.fn(),
	};

	handleSessionExpired(queryClient as unknown as QueryClient, router);

	return { queryClient, router };
}

describe("handleSessionExpired", () => {
	test("clears the query cache", () => {
		const { queryClient } = setup({ resolvedRouteIds: PUBLIC_ROUTES });

		expect(queryClient.removeQueries).toHaveBeenCalledTimes(1);
	});

	test("redirects to login when the current route is private", () => {
		const { router } = setup();

		expect(router.getMatchedRoutes).toHaveBeenCalledWith("/account");
		expect(router.navigate).toHaveBeenCalledWith({
			to: "/login",
			search: { redirect: "/account?tab=1", reason: "expired" },
			replace: true,
		});
	});

	test("does not navigate when the current route is public", () => {
		const { router } = setup({ resolvedRouteIds: PUBLIC_ROUTES });

		expect(router.navigate).not.toHaveBeenCalled();
	});

	test("does not navigate while a navigation to login is pending", () => {
		const { router } = setup({ latestPathname: "/login" });

		expect(router.navigate).not.toHaveBeenCalled();
	});

	test("does not navigate before the first location is committed", () => {
		const { router } = setup({ resolved: false });

		expect(router.navigate).not.toHaveBeenCalled();
	});
});
