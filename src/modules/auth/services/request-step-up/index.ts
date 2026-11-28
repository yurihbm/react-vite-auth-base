import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";

/**
 * Sends a POST request to email a step-up code to the user.
 *
 * @returns A promise that resolves when the code is sent (202).
 */
async function requestStepUp() {
	await client.post("/auth/step-up");
}

/** Cache key used for the request step-up mutation. */
export const requestStepUpKey = "auth/request-step-up";

/** Hook to manage the request step-up mutation state using TanStack Query. */
export function useRequestStepUp() {
	return useMutation({
		mutationKey: [requestStepUpKey],
		mutationFn: requestStepUp,
	});
}
