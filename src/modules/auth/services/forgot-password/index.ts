import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";

/** Data required to request a password reset. */
interface ForgotPasswordData {
	/** Email of the account to reset. */
	email: string;
}

/**
 * Sends a POST request to email a password reset code. The API answers the same
 * way for unknown addresses, so it never reveals whether an account exists.
 *
 * @param data - The account email.
 * @returns A promise that resolves when the request is accepted.
 */
async function forgotPassword({ email }: ForgotPasswordData) {
	await client.post("/auth/password/forgot", { data: { email } });
}

/** Cache key used for the forgot password mutation. */
export const forgotPasswordKey = "auth/forgot-password";

/**
 * Hook to manage the forgot password mutation state using TanStack Query.
 *
 * @returns The mutation object for managing the request process.
 */
export function useForgotPassword() {
	return useMutation({
		mutationKey: [forgotPasswordKey],
		mutationFn: forgotPassword,
	});
}
