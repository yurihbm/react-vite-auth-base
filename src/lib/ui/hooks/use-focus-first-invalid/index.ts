import type { RefObject } from "react";

import { useEffect, useRef, useState } from "react";

export interface UseFocusFirstInvalidResult<T extends HTMLElement> {
	/** Attach to the form (or any element containing its fields). */
	ref: RefObject<T | null>;
	/** Call after a failed submit; focus moves once the errors have rendered. */
	focusFirstInvalid: () => void;
}

/**
 * Moves focus to the first field marked `aria-invalid="true"` after a failed
 * submit, so keyboard and screen reader users land on what needs fixing.
 */
export function useFocusFirstInvalid<
	T extends HTMLElement,
>(): UseFocusFirstInvalidResult<T> {
	const ref = useRef<T>(null);
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		if (attempt === 0) {
			return;
		}

		ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
	}, [attempt]);

	return {
		ref,
		focusFirstInvalid: () => setAttempt((value) => value + 1),
	};
}
