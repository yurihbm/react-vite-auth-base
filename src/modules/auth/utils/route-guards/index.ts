import type { User } from "@src/modules/users";
import type { QueryClient } from "@tanstack/react-query";

import { redirect } from "@tanstack/react-router";

import { GET_ME_QUERY_OPTIONS } from "@src/modules/users";

type AuthState =
	| {
			user: User;
			isAuthenticated: true;
	  }
	| {
			isAuthenticated: false;
			user: null;
	  };

/**
 * Attempts to resolve the user's authentication status by fetching their data.
 *
 * @param queryClient - The QueryClient instance used to perform the fetch
 * operation.
 * @returns A promise that resolves to an AuthState object indicating whether
 * the user is authenticated. If the fetch succeeds, isAuthenticated will be
 * true; if it fails (e.g., due to a 401 Unauthorized error), isAuthenticated
 * will be false.
 */
async function resolveAuth(queryClient: QueryClient): Promise<AuthState> {
	try {
		const user = await queryClient.fetchQuery(GET_ME_QUERY_OPTIONS);
		return { user, isAuthenticated: true };
	} catch {
		return { user: null, isAuthenticated: false };
	}
}

/**
 * A route guard function that restricts access to routes intended only for
 * unauthenticated users (e.g., login or registration pages).
 * If the user is already authenticated, they will be redirected to the home
 * page.
 *
 * Use it in the beforeLoad hook of routes.
 */
export async function publicOnlyRouteBeforeLoad({
	context,
}: {
	context: { queryClient: QueryClient };
}) {
	const auth = await resolveAuth(context.queryClient);
	if (auth.isAuthenticated) {
		throw redirect({
			to: "/",
			replace: true,
		});
	}
}

/**
 * A route guard function that restricts access to routes intended only for
 * authenticated users (e.g., dashboard or profile pages).
 * If the user is not authenticated, they will be redirected to the login page,
 * with a redirect query parameter that points back to the originally requested
 * page.
 *
 * Use it in the beforeLoad hook of routes.
 */
export async function privateRouteBeforeLoad({
	context,
	location,
}: {
	context: { queryClient: QueryClient };
	location: { href: string };
}) {
	const auth = await resolveAuth(context.queryClient);
	if (!auth.isAuthenticated) {
		throw redirect({
			to: "/login",
			search: {
				redirect: location.href,
			},
			replace: true,
		});
	}
}
