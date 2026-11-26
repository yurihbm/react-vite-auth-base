import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@lib/api";

/**
 * Sends a POST request to the logout endpoint to log out the current user. The
 * endpoint invalidates the authentication cookies.
 *
 * @returns A promise that resolves when the logout is successful.
 */

async function logout() {
	await client.post("/auth/logout");
}

/** Cache key used for the logout mutation. */
export const logoutKey = "auth/logout";

/**
 * Hook to manage the logout mutation state using TanStack Query.
 *
 * @remarks
 *   On successful logout, all cached data is dropped so that no user-specific
 *   data outlives the session.
 * @example
 * 	```tsx
 * 	const { mutate, isPending } = useLogout();
 *
 * 	function handleClick() {
 * 		mutate(data, {
 * 			onSuccess: () => {
 * 				// Handle successful logout (e.g., redirect)
 * 			},
 * 		});
 * 	}
 * 	```;
 *
 * @returns The mutation object for managing the logout process, including
 *   pending, error, and success states.
 */
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [logoutKey],
		mutationFn: logout,
		onSuccess: () => {
			// Removing a mounted query would detach its observers, and the next
			// render would rebuild and refetch it (me, then a failing refresh). The
			// mounted queries are reset to an empty state instead, without a refetch.
			queryClient.removeQueries({ type: "inactive" });
			queryClient
				.getQueryCache()
				.findAll({ type: "active" })
				.forEach((query) => query.reset());
		},
	});
}
