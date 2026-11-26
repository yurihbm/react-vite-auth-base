import type {
	CSSProperties,
	KeyboardEvent as ReactKeyboardEvent,
	RefObject,
} from "react";

import { useEffect, useRef, useState } from "react";

export interface UseDropdownMenuResult {
	open: boolean;
	triggerRef: RefObject<HTMLElement | null>;
	menuRef: RefObject<HTMLElement | null>;
	menuStyle: CSSProperties;
	toggle: () => void;
	close: () => void;
	handleTriggerKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
	handleMenuKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

function getMenuItems(menu: HTMLElement): HTMLElement[] {
	return Array.from(
		menu.querySelectorAll<HTMLElement>(
			'[role="menuitem"]:not([aria-disabled])',
		),
	);
}

const GAP = 4;
const EDGE_PADDING = 8;
const FALLBACK_MENU_WIDTH = 160;

function computePosition(
	trigger: HTMLElement,
	menu: HTMLElement | null,
): CSSProperties {
	const rect = trigger.getBoundingClientRect();
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	const menuWidth = menu?.offsetWidth || FALLBACK_MENU_WIDTH;
	const menuHeight = menu?.offsetHeight || 0;

	// Clamp horizontally so the menu stays inside the viewport
	const left = Math.max(
		EDGE_PADDING,
		Math.min(rect.left, vw - menuWidth - EDGE_PADDING),
	);

	// Flip above the trigger when there is more space above than below
	const spaceBelow = vh - rect.bottom - GAP;
	const spaceAbove = rect.top - GAP;

	if (menu && menuHeight > spaceBelow && spaceAbove > spaceBelow) {
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

export function useDropdownMenu(): UseDropdownMenuResult {
	const [open, setOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
	const triggerRef = useRef<HTMLElement>(null);
	const menuRef = useRef<HTMLElement>(null);

	function close() {
		setOpen(false);
		triggerRef.current?.focus();
	}

	function toggle() {
		if (open) {
			close();
			return;
		}

		// Initial estimate before menu is in the DOM; refined by the effect below.
		if (triggerRef.current) {
			setMenuStyle(computePosition(triggerRef.current, null));
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
				!menuRef.current?.contains(target)
			) {
				setOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [open]);

	// Move focus to the menu when it opens so keyboard navigation works immediately.
	useEffect(() => {
		if (open) {
			menuRef.current?.focus();
		}
	}, [open]);

	// Recompute position after the menu renders (for accurate clamping/flipping)
	// and keep it up-to-date on scroll or resize.
	useEffect(() => {
		if (!open) {
			return;
		}

		function recompute() {
			if (triggerRef.current) {
				setMenuStyle(computePosition(triggerRef.current, menuRef.current));
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
				setMenuStyle(computePosition(triggerRef.current, null));
			}

			setOpen(true);
		} else if (e.key === "Escape") {
			e.preventDefault();
			setOpen(false);
		}
	}

	function handleMenuKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
		const menu = menuRef.current;

		if (!menu) {
			return;
		}

		const items = getMenuItems(menu);
		const currentIndex = items.indexOf(document.activeElement as HTMLElement);

		if (e.key === "ArrowDown") {
			e.preventDefault();
			const next = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
			items[next]?.focus();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			const prev = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
			items[prev]?.focus();
		} else if (e.key === "Escape" || e.key === "Tab") {
			e.preventDefault();
			close();
		}
	}

	return {
		open,
		triggerRef,
		menuRef,
		menuStyle,
		toggle,
		close,
		handleTriggerKeyDown,
		handleMenuKeyDown,
	};
}
