import { useEffect, useState } from "react";

import { APIError } from "@lib/api";

/** Cooldown, in seconds, when the API gives no `Retry-After`. */
const DEFAULT_COOLDOWN_SECONDS = 60;

/** Seconds to wait after `error`: 0 unless it is a 429. */
function cooldownOf(error: unknown) {
	if (error instanceof APIError && error.status === 429) {
		return error.retryAfter ?? DEFAULT_COOLDOWN_SECONDS;
	}

	return 0;
}

/**
 * Counts down seconds to keep an action disabled, such as a resend button.
 *
 * It also starts on its own when `error` is a 429, using the API's `retryAfter`
 * when present and 60 seconds otherwise.
 *
 * @param error - The latest error of the guarded action.
 * @returns The seconds `remaining` (0 when idle) and `start` to begin a
 *   cooldown.
 */
export function useCooldown(error?: unknown) {
	const [remaining, setRemaining] = useState(() => cooldownOf(error));
	const [handledError, setHandledError] = useState(error);

	// Adjusts state while rendering, which React prefers over an effect when
	// state derives from a changed prop.
	if (error !== handledError) {
		setHandledError(error);

		const seconds = cooldownOf(error);

		if (seconds > 0) {
			setRemaining(seconds);
		}
	}

	const isCoolingDown = remaining > 0;

	useEffect(() => {
		if (!isCoolingDown) {
			return;
		}

		const interval = setInterval(
			() => setRemaining((current) => Math.max(0, current - 1)),
			1000,
		);

		return () => clearInterval(interval);
	}, [isCoolingDown]);

	return {
		remaining,
		start: (seconds: number = DEFAULT_COOLDOWN_SECONDS) =>
			setRemaining(seconds),
	};
}
