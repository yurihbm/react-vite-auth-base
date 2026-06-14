import type { SelectOption } from "@src/modules/shared/components/option-list/types";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseComboboxParams {
	/** The currently visible (filtered) options. */
	options: SelectOption[];
	/** Invoked when an option is chosen via mouse or keyboard. */
	onSelect: (option: SelectOption) => void;
	/** Close the dropdown after a selection (single-select behaviour). */
	closeOnSelect: boolean;
	disabled?: boolean;
	/** Clears the search query. Called on close. */
	onQueryReset: () => void;
}

export interface UseComboboxResult {
	open: boolean;
	activeIndex: number;
	rootRef: RefObject<HTMLDivElement | null>;
	searchRef: RefObject<HTMLInputElement | null>;
	openDropdown: () => void;
	close: () => void;
	toggle: () => void;
	selectOption: (option: SelectOption) => void;
	handleTriggerKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
	handleSearchKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
}

function findNextEnabled(
	options: SelectOption[],
	from: number,
	direction: 1 | -1,
): number {
	const count = options.length;

	for (let step = 1; step <= count; step++) {
		const index = (from + direction * step + count * step) % count;

		if (!options[index]?.disabled) {
			return index;
		}
	}

	return from;
}

/**
 * Shared dropdown behaviour for `Select` and `MultiSelect`: open state,
 * keyboard navigation, click-outside dismissal, and focus management. Filtering
 * lives in `useFilteredOptions`; this hook only navigates the provided list.
 */
export function useCombobox({
	options,
	onSelect,
	closeOnSelect,
	disabled = false,
	onQueryReset,
}: UseComboboxParams): UseComboboxResult {
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [optionCount, setOptionCount] = useState(options.length);
	const rootRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	// Keep the active index within bounds as the filtered list changes. Adjusting
	// derived state during render is the recommended alternative to an effect.
	if (options.length !== optionCount) {
		setOptionCount(options.length);

		if (activeIndex >= options.length) {
			setActiveIndex(options.length > 0 ? options.length - 1 : -1);
		}
	}

	const close = useCallback(() => {
		setOpen(false);
		setActiveIndex(-1);
		onQueryReset();
	}, [onQueryReset]);

	const openDropdown = useCallback(() => {
		if (disabled) {
			return;
		}

		setOpen(true);
		setActiveIndex(options.length > 0 ? 0 : -1);
	}, [disabled, options.length]);

	const toggle = useCallback(() => {
		if (open) {
			close();
		} else {
			openDropdown();
		}
	}, [open, close, openDropdown]);

	const selectOption = useCallback(
		(option: SelectOption) => {
			if (option.disabled) {
				return;
			}

			onSelect(option);

			if (closeOnSelect) {
				close();
			}
		},
		[onSelect, closeOnSelect, close],
	);

	// Focus the search field when the dropdown opens.
	useEffect(() => {
		if (open) {
			searchRef.current?.focus();
		}
	}, [open]);

	// Dismiss when clicking outside the combobox.
	useEffect(() => {
		if (!open) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			if (!rootRef.current?.contains(event.target as Node)) {
				close();
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [open, close]);

	const handleTriggerKeyDown = useCallback(
		(event: ReactKeyboardEvent<HTMLElement>) => {
			if (disabled) {
				return;
			}

			if (
				event.key === "ArrowDown" ||
				event.key === "Enter" ||
				event.key === " "
			) {
				event.preventDefault();
				openDropdown();
			}
		},
		[disabled, openDropdown],
	);

	const handleSearchKeyDown = useCallback(
		(event: ReactKeyboardEvent<HTMLInputElement>) => {
			switch (event.key) {
				case "ArrowDown":
					event.preventDefault();
					setActiveIndex((current) => findNextEnabled(options, current, 1));
					break;
				case "ArrowUp":
					event.preventDefault();
					setActiveIndex((current) => findNextEnabled(options, current, -1));
					break;
				case "Enter": {
					event.preventDefault();
					const option = options[activeIndex];
					if (option) {
						selectOption(option);
					}
					break;
				}
				case "Escape":
					event.preventDefault();
					close();
					break;
				case "Tab":
					close();
					break;
			}
		},
		[options, activeIndex, selectOption, close],
	);

	return {
		open,
		activeIndex,
		rootRef,
		searchRef,
		openDropdown,
		close,
		toggle,
		selectOption,
		handleTriggerKeyDown,
		handleSearchKeyDown,
	};
}
