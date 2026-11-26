import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";

/**
 * Sends a POST request to end every session of the user except the current one.
 *
 * @returns A promise that resolves when the other sessions are ended (204).
 */
async function logoutOthers() {
	await client.post("/auth/logout-others");
}

/** Cache key used for the logout-others mutation. */
export const logoutOthersKey = "auth/logout-others";

/** Hook to manage the logout-others mutation state using TanStack Query. */
export function useLogoutOthers() {
	return useMutation({
		mutationKey: [logoutOthersKey],
		mutationFn: logoutOthers,
	});
}
