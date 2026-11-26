import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";
import { useStepUpMutation } from "@modules/auth/hooks/use-step-up-mutation";

/** Data required to delete a user. */
interface DeleteUserData {
	/** The UUID of the user to delete. */
	uuid: string;
}

/**
 * Sends a DELETE request to remove a user. It needs a recent step-up. Deleting
 * your own account also clears the auth cookies.
 *
 * @param data - The user UUID.
 * @returns A promise that resolves when the user is deleted (204).
 */
async function deleteUser({ uuid }: DeleteUserData) {
	await client.delete(`/users/${uuid}`);
}

/** Cache key used for the delete user mutation. */
export const deleteUserKey = "users/delete";

/** Hook to manage the delete user mutation, asking for a step-up. */
export function useDeleteUser() {
	const mutationFn = useStepUpMutation(deleteUser);

	return useMutation({ mutationKey: [deleteUserKey], mutationFn });
}
