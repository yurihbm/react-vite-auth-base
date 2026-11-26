import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";
import { useStepUpMutation } from "@modules/auth/hooks/use-step-up-mutation";

/** Data required to change the password. */
interface ChangePasswordData {
	newPassword: string;
}

/**
 * Sends a POST request to set a new password. It needs a recent step-up and
 * signs out the other devices.
 *
 * @param data - The new password.
 * @returns A promise that resolves when the password is changed (204).
 */
async function changePassword({ newPassword }: ChangePasswordData) {
	await client.post("/users/me/password", {
		data: { new_password: newPassword },
	});
}

/** Cache key used for the change password mutation. */
export const changePasswordKey = "users/change-password";

/** Hook to manage the change password mutation, asking for a step-up. */
export function useChangePassword() {
	const mutationFn = useStepUpMutation(changePassword);

	return useMutation({ mutationKey: [changePasswordKey], mutationFn });
}
