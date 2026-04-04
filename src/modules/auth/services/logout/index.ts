import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@src/lib/api";

/**
 * Sends a POST request to the logout endpoint to log out the current user.
 * The endpoint invalidates the authentication cookies.
 *
 * @returns A promise that resolves when the logout is successful.
 */

async function logout() {
	await client.post("/auth/logout");
}

/**
 * Cache key used for the logout mutation.
 */
export const logoutKey = "auth/logout";

/**
 * Hook to manage the logout mutation state using TanStack Query.
 *
 * @remarks
 * On successful logout, all queries are invalidated to ensure that any
 * user-specific data is refetched, reflecting the logged-out state.
 *
 * @returns The mutation object for managing the logout process, including
 * pending, error, and success states.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useLogout();
 *
 * function handleClick() {
 *   mutate(data, {
 *     onSuccess: () => {
 *       // Handle successful logout (e.g., redirect)
 *     }
 *   });
 * };
 * ```
 */
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [logoutKey],
		mutationFn: logout,
		onSuccess: () => {
			// Invalidate all queries to ensure that any user-specific data is refetched.
			queryClient.invalidateQueries();
		},
	});
}
