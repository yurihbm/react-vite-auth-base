import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";

import { createContext, useContext } from "react";

export interface PopoverContextValue {
	open: boolean;
	toggle: () => void;
	close: () => void;
	triggerRef: RefObject<HTMLElement | null>;
	handleTriggerKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(): PopoverContextValue {
	const ctx = useContext(PopoverContext);
	if (!ctx)
		throw new Error(
			"Popover.Trigger and Popover.Content must be rendered inside Popover",
		);
	return ctx;
}
