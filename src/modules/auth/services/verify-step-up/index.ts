import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";

/** Data required to verify a step-up code. */
interface VerifyStepUpData {
	/** The 6-digit code emailed to the user. */
	code: string;
}

/**
 * Sends a POST request to elevate the session with the emailed step-up code.
 *
 * @param data - The emailed code.
 * @returns A promise that resolves when the session is elevated.
 */
async function verifyStepUp({ code }: VerifyStepUpData) {
	await client.post("/auth/step-up/verify", { data: { code } });
}

/** Cache key used for the verify step-up mutation. */
export const verifyStepUpKey = "auth/verify-step-up";

/** Hook to manage the verify step-up mutation state using TanStack Query. */
export function useVerifyStepUp() {
	return useMutation({
		mutationKey: [verifyStepUpKey],
		mutationFn: verifyStepUp,
	});
}
