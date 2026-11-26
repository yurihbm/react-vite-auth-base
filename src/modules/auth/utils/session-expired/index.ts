import type { QueryClient } from "@tanstack/react-query";

/** Route id of the layout that groups every private route. */
const PRIVATE_ROUTE_ID = "/_authenticated";

const LOGIN_PATH = "/login";

/** The subset of the router used to react to an expired session. */
interface SessionRouter {
	/** The latest location, including one whose navigation is still pending. */
	latestLocation: { pathname: string };
	state: {
		/** The last committed location. */
		resolvedLocation?: { pathname: string; href: string };
	};
	getMatchedRoutes: (
		pathname: string,
	) => readonly [matchedRoutes: ReadonlyArray<{ id: string }>, ...unknown[]];
	navigate: (options: {
		to: "/login";
		search: { redirect: string; reason: "expired" };
		replace: true;
	}) => unknown;
}

/**
 * Handles a session that could not be renewed: drops every cached query and,
 * when the user is on a private route, sends them to the login page with a
 * redirect back to it.
 *
 * The decision uses the last committed location: while a navigation is pending,
 * the router already exposes the next location but not its matches. Nothing
 * happens when that navigation already goes to the login page (e.g. its guard
 * refetching the user), which would otherwise nest redirects.
 *
 * Register it with `client.onSessionExpired` at the app entry point.
 */
export function handleSessionExpired(
	queryClient: QueryClient,
	router: SessionRouter,
) {
	queryClient.removeQueries();

	const { resolvedLocation } = router.state;

	if (!resolvedLocation || router.latestLocation.pathname === LOGIN_PATH) {
		return;
	}

	const [matchedRoutes] = router.getMatchedRoutes(resolvedLocation.pathname);
	const isPrivate = matchedRoutes.some(({ id }) =>
		id.startsWith(PRIVATE_ROUTE_ID),
	);

	if (isPrivate) {
		router.navigate({
			to: LOGIN_PATH,
			search: { redirect: resolvedLocation.href, reason: "expired" },
			replace: true,
		});
	}
}
