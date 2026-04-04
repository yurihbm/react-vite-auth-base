import type { User } from "../../types";

import { useQuery } from "@tanstack/react-query";

import { client } from "@src/lib/api";

/**
 * Internal interface representing the API response format for a user.
 * Dates are received as Unix timestamps (milliseconds).
 */
interface UserResponse extends Omit<User, "createdAt" | "updatedAt"> {
	created_at: number;
	updated_at: number;
}

/**
 * Fetches the currently authenticated user's profile information.
 *
 * @param signal - An optional AbortSignal to cancel the request.
 * @returns A promise that resolves to a `User` object with ISO-formatted dates.
 */
async function getMe(signal?: AbortSignal): Promise<User> {
	const { data } = await client.get<UserResponse>("/users/me", { signal });

	return {
		uuid: data.uuid,
		name: data.name,
		email: data.email,
		role: data.role,
		createdAt: new Date(data.created_at).toISOString(),
		updatedAt: new Date(data.updated_at).toISOString(),
	};
}

/**
 * The unique query key used for caching the "get me" request.
 */
export const getMeKey = "users/me";

/**
 * A TanStack Query hook to fetch and manage the current user's session state.
 *
 * @example
 * ```tsx
 * const { data: user, isPending, error } = useGetMe();
 *
 * if (isPending) return <Spinner />;
 * if (error) return <Redirect to="/login" />;
 * return <div>Welcome, {user.name}</div>;
 * ```
 *
 * @returns The standard useQuery result object containing the user data and status.
 */
export function useGetMe() {
	return useQuery({
		queryKey: [getMeKey],
		queryFn: ({ signal }) => getMe(signal),
		retry: false,
	});
}
