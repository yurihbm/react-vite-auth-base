import { useEffect, useState } from "react";

/**
 * Returns `value`, delayed until it has stopped changing for `delay` ms.
 *
 * @param value - The fast-changing value.
 * @param delay - The quiet time, in milliseconds, before the value is applied.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timeout = setTimeout(() => setDebounced(value), delay);

		return () => clearTimeout(timeout);
	}, [value, delay]);

	return debounced;
}
