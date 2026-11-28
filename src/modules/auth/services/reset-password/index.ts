import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";

/** Data required to reset a password. */
interface ResetPasswordData {
	/** The 6-digit code emailed to the user. */
	code: string;
	/** The new plain-text password. */
	password: string;
}

/**
 * Sends a POST request to set a new password with the emailed code. It needs
 * the `password_reset` cookie. The API signs out every device and does not log
 * the user in.
 *
 * @param data - The code and the new password.
 * @returns A promise that resolves when the password is reset.
 */
async function resetPassword({ code, password }: ResetPasswordData) {
	await client.post("/auth/password/reset", { data: { code, password } });
}

/** Cache key used for the reset password mutation. */
export const resetPasswordKey = "auth/reset-password";

/**
 * Hook to manage the reset password mutation state using TanStack Query.
 *
 * @returns The mutation object for managing the reset process.
 */
export function useResetPassword() {
	return useMutation({
		mutationKey: [resetPasswordKey],
		mutationFn: resetPassword,
	});
}
