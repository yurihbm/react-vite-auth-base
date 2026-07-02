import type {
	CSSProperties,
	KeyboardEvent as ReactKeyboardEvent,
	RefObject,
} from "react";

import { useEffect, useRef, useState } from "react";

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

const GAP = 4;
const EDGE_PADDING = 8;
const FALLBACK_CONTENT_WIDTH = 240;

function computePosition(
	trigger: HTMLElement,
	content: HTMLElement | null,
): CSSProperties {
	const rect = trigger.getBoundingClientRect();
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	const contentWidth = content?.offsetWidth || FALLBACK_CONTENT_WIDTH;
	const contentHeight = content?.offsetHeight || 0;

	// Clamp horizontally so the content stays inside the viewport
	const left = Math.max(
		EDGE_PADDING,
		Math.min(rect.left, vw - contentWidth - EDGE_PADDING),
	);

	// Flip above the trigger when there is more space above than below
	const spaceBelow = vh - rect.bottom - GAP;
	const spaceAbove = rect.top - GAP;

	if (content && contentHeight > spaceBelow && spaceAbove > spaceBelow) {
		return {
			position: "fixed",
			bottom: vh - rect.top + GAP,
			left,
			maxWidth: vw - 2 * EDGE_PADDING,
		};
	}

	return {
		position: "fixed",
		top: rect.bottom + GAP,
		left,
		maxWidth: vw - 2 * EDGE_PADDING,
	};
}

export function usePopover(): UsePopoverResult {
	const [open, setOpen] = useState(false);
	const [contentStyle, setContentStyle] = useState<CSSProperties>({});
	const triggerRef = useRef<HTMLElement>(null);
	const contentRef = useRef<HTMLElement>(null);

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
	}, [open]);

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
