import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client, request } from "@lib/api";
import { getMeKey, toUser, UserSchema } from "@modules/users";

/** Data required to verify a pending sign-up. */
interface VerifySignupData {
	/** The 6-digit code emailed to the user. */
	code: string;
}

/**
 * Sends a POST request to complete a pending sign-up (credentials or OAuth). It
 * needs the `pending_signup` cookie and logs the new user in.
 *
 * @param data - The emailed code.
 * @returns A promise that resolves to the created `User`.
 */
async function verifySignup({ code }: VerifySignupData) {
	const { data } = await request(
		UserSchema,
		client.post("/auth/signup/verify", { data: { code } }),
	);

	return toUser(data);
}

/** Cache key used for the verify signup mutation. */
export const verifySignupKey = "auth/verify-signup";

/**
 * Hook to manage the verify signup mutation state using TanStack Query.
 *
 * @remarks
 *   On success the created user becomes the current user, so no extra request
 *   is needed to reflect the logged-in state.
 * @returns The mutation object for managing the verification process.
 */
export function useVerifySignup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [verifySignupKey],
		mutationFn: verifySignup,
		onSuccess: (user) => {
			queryClient.setQueryData([getMeKey], user);
		},
	});
}
