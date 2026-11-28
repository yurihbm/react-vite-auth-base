import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";
import { useStepUpMutation } from "@modules/auth/hooks/use-step-up-mutation";

/** Data required to request an email change. */
interface RequestEmailChangeData {
	/** The new email address, which receives the confirmation code. */
	email: string;
}

/**
 * Sends a POST request to email a confirmation code to the new address. It
 * needs a recent step-up.
 *
 * @param data - The new email address.
 * @returns A promise that resolves when the code is sent (202).
 */
async function requestEmailChange({ email }: RequestEmailChangeData) {
	await client.post("/users/me/email", { data: { email } });
}

/** Cache key used for the request email change mutation. */
export const requestEmailChangeKey = "users/request-email-change";

/** Hook to manage the request email change mutation, asking for a step-up. */
export function useRequestEmailChange() {
	const mutationFn = useStepUpMutation(requestEmailChange);

	return useMutation({ mutationKey: [requestEmailChangeKey], mutationFn });
}
