import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@lib/api";

/** Data required to confirm an email change. */
interface ConfirmEmailChangeData {
	/** The 6-digit code emailed to the new address. */
	code: string;
}

/**
 * Sends a POST request to apply the new email. The API signs the user out of
 * every device.
 *
 * @param data - The emailed code.
 * @returns A promise that resolves when the email is changed.
 */
async function confirmEmailChange({ code }: ConfirmEmailChangeData) {
	await client.post("/users/me/email/confirm", { data: { code } });
}

/** Cache key used for the confirm email change mutation. */
export const confirmEmailChangeKey = "users/confirm-email-change";

/**
 * Hook to manage the confirm email change mutation state using TanStack Query.
 *
 * @remarks
 *   On success all cached data is dropped, since the API signed the user out of
 *   every device.
 */
export function useConfirmEmailChange() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [confirmEmailChangeKey],
		mutationFn: confirmEmailChange,
		onSuccess: () => {
			// Removing a mounted query would detach its observers (e.g. the header
			// would keep the old user), so mounted queries are reset to an empty
			// state instead, without a refetch that would only expire the session.
			queryClient.removeQueries({ type: "inactive" });
			queryClient
				.getQueryCache()
				.findAll({ type: "active" })
				.forEach((query) => query.reset());
		},
	});
}
