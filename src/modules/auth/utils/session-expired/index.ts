import type { QueryClient } from "@tanstack/react-query";

/** Route id of the layout that groups every private route. */
const PRIVATE_ROUTE_ID = "/_authenticated";

/** The subset of the router used to react to an expired session. */
interface SessionRouter {
	state: {
		location: { href: string };
		matches: ReadonlyArray<{ routeId: string }>;
	};
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
 * Register it with `client.onSessionExpired` at the app entry point.
 */
export function handleSessionExpired(
	queryClient: QueryClient,
	router: SessionRouter,
) {
	queryClient.removeQueries();

	const isPrivate = router.state.matches.some(({ routeId }) =>
		routeId.startsWith(PRIVATE_ROUTE_ID),
	);

	if (isPrivate) {
		router.navigate({
			to: "/login",
			search: { redirect: router.state.location.href, reason: "expired" },
			replace: true,
		});
	}
}
