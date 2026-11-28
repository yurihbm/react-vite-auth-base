import { useCallback } from "react";

import { APIError } from "@lib/api";
import { useStepUp } from "@modules/auth/providers/step-up/context";

/** Key of the 403 sent by routes that need a recent step-up. */
const STEP_UP_REQUIRED_KEY = "auth.stepUp.required";

/**
 * Wraps a mutation function so that, when the API asks for a step-up, the user
 * confirms their identity and the call is retried once.
 *
 * Only the key is matched, since 403 is also used for other errors. The step-up
 * middleware rejects before the handler runs, so retrying is safe.
 *
 * @example
 * 	```ts
 * 	const mutationFn = useStepUpMutation(changePassword);
 * 	return useMutation({ mutationFn });
 * 	```;
 *
 * @param fn - The mutation function that may need a step-up.
 * @returns A function with the same signature as `fn`.
 */
export function useStepUpMutation<Variables, Result>(
	fn: (variables: Variables) => Promise<Result>,
) {
	const { requestStepUp } = useStepUp();

	return useCallback(
		async (variables: Variables) => {
			try {
				return await fn(variables);
			} catch (error) {
				if (
					!(error instanceof APIError) ||
					error.key !== STEP_UP_REQUIRED_KEY
				) {
					throw error;
				}

				await requestStepUp();

				return fn(variables);
			}
		},
		[fn, requestStepUp],
	);
}
