import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@lib/api";

/** Data required to revert an OAuth provider link. */
interface RevertOAuthLinkData {
	/** The token from the undo link emailed when the provider was linked. */
	token: string;
}

/**
 * Sends a POST request to unlink an OAuth provider that was linked silently.
 * The endpoint also signs the user out of every device.
 *
 * @param data - The undo token.
 * @returns A promise that resolves when the link is reverted.
 */
async function revertOAuthLink({ token }: RevertOAuthLinkData) {
	await client.post("/auth/oauth/revert-link", { data: { token } });
}

/** Cache key used for the revert OAuth link mutation. */
export const revertOAuthLinkKey = "auth/revert-oauth-link";

/**
 * Hook to manage the revert OAuth link mutation state using TanStack Query.
 *
 * @remarks
 *   On success all cached queries are removed, since the API signed the user
 *   out of every device.
 * @returns The mutation object for managing the revert process.
 */
export function useRevertOAuthLink() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [revertOAuthLinkKey],
		mutationFn: revertOAuthLink,
		onSuccess: () => {
			queryClient.removeQueries();
		},
	});
}
