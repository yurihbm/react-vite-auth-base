import { useEffect, useId, useSyncExternalStore } from "react";

let stack: string[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSnapshot() {
	return stack;
}

function notify() {
	for (const listener of listeners) {
		listener();
	}
}

export interface DialogStackPosition {
	/** Position in the stack (0 for the first opened), or `-1` while closed. */
	index: number;
	/** Whether this dialog is the most recently opened one. */
	isTop: boolean;
}

/**
 * Tracks the order in which dialogs are opened so the most recently opened
 * one can be rendered above the others, and only it shows an interactive
 * backdrop.
 */
export function useDialogStack(open: boolean): DialogStackPosition {
	const id = useId();
	const currentStack = useSyncExternalStore(subscribe, getSnapshot);

	useEffect(() => {
		if (!open) {
			return;
		}

		stack = [...stack, id];
		notify();

		return () => {
			stack = stack.filter((stackId) => stackId !== id);
			notify();
		};
	}, [open, id]);

	if (!open) {
		return { index: -1, isTop: false };
	}

	const index = currentStack.indexOf(id);
	return { index, isTop: index === currentStack.length - 1 };
}
