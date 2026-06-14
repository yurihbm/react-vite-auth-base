import type { SelectOption } from "@src/modules/shared/components/option-list/types";

import { useEffect, useMemo, useRef, useState } from "react";

export interface UseFilteredOptionsParams {
	/** The full set of options to filter against (client-side mode). */
	options: SelectOption[];
	/** The current search query. */
	query: string;
	/**
	 * When provided, switches to async mode: the hook debounces the query and
	 * delegates filtering to this callback (e.g. a remote search). The resolved
	 * options become the filtered result.
	 */
	onSearch?: (query: string) => Promise<SelectOption[]>;
	/** Debounce delay for async mode, in milliseconds. Defaults to 300. */
	debounceMs?: number;
}

export interface UseFilteredOptionsResult {
	filtered: SelectOption[];
	isLoading: boolean;
}

function filterLocally(options: SelectOption[], query: string): SelectOption[] {
	const normalized = query.trim().toLowerCase();

	if (!normalized) {
		return options;
	}

	return options.filter((option) =>
		option.label.toLowerCase().includes(normalized),
	);
}

/**
 * Filters a list of options based on a search query.
 *
 * - Without `onSearch`, filtering happens locally (case-insensitive label match).
 * - With `onSearch`, the query is debounced and filtering is delegated to the
 *   callback, exposing an `isLoading` flag while the promise is pending.
 */
export function useFilteredOptions({
	options,
	query,
	onSearch,
	debounceMs = 300,
}: UseFilteredOptionsParams): UseFilteredOptionsResult {
	const localFiltered = useMemo(
		() => filterLocally(options, query),
		[options, query],
	);

	const [asyncState, setAsyncState] = useState({
		options,
		filtered: options,
	});
	const [isLoading, setIsLoading] = useState(false);
	const requestIdRef = useRef(0);

	if (asyncState.options !== options) {
		setAsyncState({ options, filtered: options });
	}

	useEffect(() => {
		if (!onSearch) {
			return;
		}

		const requestId = ++requestIdRef.current;

		const timeoutId = setTimeout(() => {
			setIsLoading(true);
			onSearch(query)
				.then((result) => {
					// Ignore stale responses from superseded requests.
					if (requestId === requestIdRef.current) {
						setAsyncState((current) =>
							current.options === options
								? { options, filtered: result }
								: current,
						);
						setIsLoading(false);
					}
				})
				.catch(() => {
					if (requestId === requestIdRef.current) {
						setAsyncState((current) =>
							current.options === options ? { options, filtered: [] } : current,
						);
						setIsLoading(false);
					}
				});
		}, debounceMs);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [options, onSearch, query, debounceMs]);

	if (onSearch) {
		return { filtered: asyncState.filtered, isLoading };
	}

	return { filtered: localFiltered, isLoading: false };
}
