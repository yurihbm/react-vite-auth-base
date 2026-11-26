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
 *   On success all cached queries are removed, since the API signed the user
 *   out of every device.
 */
export function useConfirmEmailChange() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [confirmEmailChangeKey],
		mutationFn: confirmEmailChange,
		onSuccess: () => {
			queryClient.removeQueries();
		},
	});
}
