import type { SelectOption } from "@src/modules/shared/components/option-list/types";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";

import { useEffect, useRef, useState } from "react";

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
	if (count === 0) {
		return -1;
	}

	const start = from < 0 ? (direction === 1 ? -1 : count) : from;

	for (let step = 1; step <= count; step++) {
		const index = (start + direction * step + count * step) % count;

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
	const onQueryResetRef = useRef(onQueryReset);

	useEffect(() => {
		onQueryResetRef.current = onQueryReset;
	}, [onQueryReset]);

	// Keep the active index within bounds as the filtered list changes. Adjusting
	// derived state during render is the recommended alternative to an effect.
	if (options.length !== optionCount) {
		setOptionCount(options.length);

		if (activeIndex >= options.length) {
			setActiveIndex(options.length > 0 ? options.length - 1 : -1);
		}
	}

	function close() {
		setOpen(false);
		setActiveIndex(-1);
		onQueryResetRef.current();
	}

	function openDropdown() {
		if (disabled) {
			return;
		}

		setOpen(true);
		setActiveIndex(options.length > 0 ? 0 : -1);
	}

	function toggle() {
		if (open) {
			close();
		} else {
			openDropdown();
		}
	}

	function selectOption(option: SelectOption) {
		if (option.disabled) {
			return;
		}

		onSelect(option);

		if (closeOnSelect) {
			close();
		}
	}

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
				setOpen(false);
				setActiveIndex(-1);
				onQueryResetRef.current();
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [open]);

	function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
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
	}

	function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
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
	}

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
