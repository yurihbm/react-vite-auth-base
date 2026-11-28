import type {
	CSSProperties,
	KeyboardEvent as ReactKeyboardEvent,
	RefObject,
} from "react";

import { useCallback, useEffect, useRef, useState } from "react";

import { computeFloatingPosition } from "@lib/ui/utils/compute-floating-position";

export interface UsePopoverParams {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export interface UsePopoverResult {
	open: boolean;
	triggerRef: RefObject<HTMLElement | null>;
	contentRef: RefObject<HTMLElement | null>;
	contentStyle: CSSProperties;
	toggle: () => void;
	close: () => void;
	handleTriggerKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
	handleContentKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

function computePosition(
	trigger: HTMLElement,
	content: HTMLElement | null,
): CSSProperties {
	return computeFloatingPosition(trigger, content);
}

export function usePopover(params: UsePopoverParams = {}): UsePopoverResult {
	const { open: controlledOpen, onOpenChange } = params;
	const isControlled = controlledOpen !== undefined;

	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const open = isControlled ? controlledOpen : uncontrolledOpen;

	const [contentStyle, setContentStyle] = useState<CSSProperties>({});
	const triggerRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLElement>(null);

	const setOpen = useCallback(
		(next: boolean) => {
			if (!isControlled) {
				setUncontrolledOpen(next);
			}
			onOpenChange?.(next);
		},
		[isControlled, onOpenChange],
	);

	function close() {
		setOpen(false);
		triggerRef.current?.focus();
	}

	function toggle() {
		if (open) {
			close();
			return;
		}

		// Initial estimate before content is in the DOM; refined by the effect below.
		if (triggerRef.current) {
			setContentStyle(computePosition(triggerRef.current, null));
		}

		setOpen(true);
	}

	// Dismiss when clicking outside.
	useEffect(() => {
		if (!open) {
			return;
		}

		function handlePointerDown(e: PointerEvent) {
			const target = e.target as Node;

			if (
				!triggerRef.current?.contains(target) &&
				!contentRef.current?.contains(target)
			) {
				setOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [open, setOpen]);

	// Move focus to the content when it opens.
	useEffect(() => {
		if (open) {
			contentRef.current?.focus();
		}
	}, [open]);

	// Recompute position after the content renders (for accurate clamping/flipping)
	// and keep it up-to-date on scroll or resize.
	useEffect(() => {
		if (!open) {
			return;
		}

		function recompute() {
			if (triggerRef.current) {
				setContentStyle(
					computePosition(triggerRef.current, contentRef.current),
				);
			}
		}

		recompute();
		window.addEventListener("scroll", recompute, true);
		window.addEventListener("resize", recompute);

		return () => {
			window.removeEventListener("scroll", recompute, true);
			window.removeEventListener("resize", recompute);
		};
	}, [open]);

	function handleTriggerKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
		if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
			e.preventDefault();

			if (triggerRef.current) {
				setContentStyle(computePosition(triggerRef.current, null));
			}

			setOpen(true);
		} else if (e.key === "Escape") {
			e.preventDefault();
			setOpen(false);
		}
	}

	function handleContentKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
		if (e.key === "Escape") {
			e.preventDefault();
			close();
		}
	}

	return {
		open,
		triggerRef,
		contentRef,
		contentStyle,
		toggle,
		close,
		handleTriggerKeyDown,
		handleContentKeyDown,
	};
}
