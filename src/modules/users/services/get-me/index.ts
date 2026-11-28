import type { User } from "@modules/users/types";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { client, request } from "@lib/api";
import { UserSchema } from "@modules/users/schemas";
import { toUser } from "@modules/users/utils";

/**
 * Fetches the currently authenticated user's profile information.
 *
 * @param signal - An optional AbortSignal to cancel the request.
 * @returns A promise that resolves to a `User` object with ISO-formatted dates.
 */
async function getMe(signal?: AbortSignal): Promise<User> {
	const { data } = await request(
		UserSchema,
		client.get("/users/me", { signal }),
	);

	return toUser(data);
}

/** The unique query key used for caching the "get me" request. */
export const getMeKey = "users/me";

export const GET_ME_QUERY_OPTIONS = queryOptions({
	queryKey: [getMeKey],
	queryFn: ({ signal }) => getMe(signal),
	retry: false,
	// The Go net/http Auth Base project uses 15min access tokens, so we can
	// safely set the stale time to 14min to avoid unnecessary refetches.
	// This must be kept in sync.
	// See [auth.go#L18](https://github.com/yurihbm/go-net-http-auth-base/blob/main/internal/domain/auth.go#L18).
	staleTime: 14 * 60 * 1000,
});

/**
 * A TanStack Query hook to fetch and manage the current user's session state.
 *
 * @example
 * 	```tsx
 * 	const { data: user, isPending, error } = useGetMe();
 *
 * 	if (isPending) return <Spinner />;
 * 	if (error) return <Redirect to="/login" />;
 * 	return <div>Welcome, {user.name}</div>;
 * 	```;
 *
 * @returns The standard useQuery result object containing the user data and
 *   status.
 */
export function useGetMe() {
	return useQuery(GET_ME_QUERY_OPTIONS);
}
