import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type PropsWithChildren } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { client } from "@lib/api";
import { jsonResponse, mockFetch } from "@lib/tests";
import { useAuth } from "@modules/auth/hooks";

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
	const queryClient = { removeQueries: vi.fn(), resetQueries: vi.fn() };
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
	test("removes inactive queries and resets mounted ones holding data", () => {
		const { queryClient } = setup({ resolvedRouteIds: PUBLIC_ROUTES });

		expect(queryClient.removeQueries).toHaveBeenCalledWith({
			type: "inactive",
		});
		expect(queryClient.resetQueries).toHaveBeenCalledWith(
			expect.objectContaining({ type: "active" }),
		);
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

	describe("with a mounted user observer", () => {
		const user = {
			uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
			name: "John Doe",
			email: "john@doe.com",
			role: "user",
			created_at: 1_710_000_000,
			updated_at: 1_710_000_000,
		};
		let unregister = () => {};

		afterEach(() => {
			unregister();
			vi.unstubAllEnvs();
			vi.unstubAllGlobals();
		});

		function renderAuth(routes: Parameters<typeof mockFetch>[0]) {
			vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
			const fetchMock = mockFetch(routes);
			const queryClient = new QueryClient();
			const router = {
				latestLocation: { pathname: "/" },
				state: { resolvedLocation: { pathname: "/", href: "/" } },
				getMatchedRoutes: () => [PUBLIC_ROUTES.map((id) => ({ id }))] as const,
				navigate: vi.fn(),
			};
			const expire = () => handleSessionExpired(queryClient, router);
			unregister = client.onSessionExpired(expire);

			const { result } = renderHook(() => useAuth(), {
				wrapper: ({ children }: PropsWithChildren) =>
					createElement(QueryClientProvider, { client: queryClient }, children),
			});

			return { result, fetchMock, queryClient, expire };
		}

		test("keeps the observer attached to the cache after a logged-out load", async () => {
			const { result, fetchMock, queryClient } = renderAuth({
				"GET /users/me": [
					jsonResponse({ error: "auth.unauthorized" }, 401),
					jsonResponse({ data: user, message: "ok" }),
				],
				"POST /auth/refresh": jsonResponse(
					{ error: "auth.refresh.missingRefreshToken" },
					401,
				),
			});

			await waitFor(() => expect(result.current.isPending).toBe(false));
			expect(result.current.isAuthenticated).toBe(false);
			expect(fetchMock.callsTo("GET /users/me")).toHaveLength(1);
			expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);

			// What a successful login does.
			await act(() => queryClient.invalidateQueries());

			await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
		});

		test("drops the cached user and other queries when another request expires the session", async () => {
			const { result, queryClient, expire } = renderAuth({
				"GET /users/me": [
					jsonResponse({ data: user, message: "ok" }),
					jsonResponse({ error: "auth.unauthorized" }, 401),
				],
				"POST /auth/refresh": jsonResponse(
					{ error: "auth.refresh.missingRefreshToken" },
					401,
				),
			});
			await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
			queryClient.setQueryData(["users", "list"], ["private"]);

			act(() => expire());

			await waitFor(() => expect(result.current.isPending).toBe(false));
			expect(result.current.isAuthenticated).toBe(false);
			expect(queryClient.getQueryData(["users", "list"])).toBeUndefined();
		});
	});
});
