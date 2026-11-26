import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@lib/api";

/** Data required to revert an email change. */
interface RevertEmailChangeData {
	/** The token from the undo link emailed to the previous address. */
	token: string;
}

/**
 * Sends a POST request to undo an email change. The endpoint restores the
 * previous email and signs the user out of every device.
 *
 * @param data - The undo token.
 * @returns A promise that resolves when the email change is reverted.
 */
async function revertEmailChange({ token }: RevertEmailChangeData) {
	await client.post("/users/revert-email-change", { data: { token } });
}

/** Cache key used for the revert email change mutation. */
export const revertEmailChangeKey = "users/revert-email-change";

/**
 * Hook to manage the revert email change mutation state using TanStack Query.
 *
 * @remarks
 *   On success all cached queries are removed, since the API signed the user
 *   out of every device.
 * @returns The mutation object for managing the revert process.
 */
export function useRevertEmailChange() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [revertEmailChangeKey],
		mutationFn: revertEmailChange,
		onSuccess: () => {
			queryClient.removeQueries();
		},
	});
}
