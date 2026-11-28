import { APIError } from "./error";

const MAX_RETRIES = 3;

/**
 * Retry policy for TanStack Query: client errors (4xx) are not retried since
 * repeating the request cannot change the outcome; anything else is retried up
 * to {@link MAX_RETRIES} times.
 */
export function shouldRetryQuery(failureCount: number, error: unknown) {
	if (error instanceof APIError && error.status >= 400 && error.status < 500) {
		return false;
	}

	return failureCount < MAX_RETRIES;
}
