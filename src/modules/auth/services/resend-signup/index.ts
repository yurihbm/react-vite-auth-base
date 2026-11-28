import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";

/**
 * Sends a POST request to email a new code for the pending sign-up. It needs
 * the `pending_signup` cookie.
 *
 * @returns A promise that resolves when the code is sent.
 */
async function resendSignup() {
	await client.post("/auth/signup/resend");
}

/** Cache key used for the resend signup mutation. */
export const resendSignupKey = "auth/resend-signup";

/**
 * Hook to manage the resend signup mutation state using TanStack Query.
 *
 * @returns The mutation object for managing the resend process.
 */
export function useResendSignup() {
	return useMutation({
		mutationKey: [resendSignupKey],
		mutationFn: resendSignup,
	});
}
