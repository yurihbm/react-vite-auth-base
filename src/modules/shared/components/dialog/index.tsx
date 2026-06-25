import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { DialogStyles, DialogVariants } from "./styles";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

import { useDialogStack } from "@src/modules/shared/hooks/use-dialog-stack";

import { Portal } from "../portal";
import {
	body,
	closeButton,
	descriptionSlot,
	footerSlot,
	header,
	overlay,
	panel,
	titleSlot,
} from "./styles";

export interface DialogProps extends DialogVariants {
	/** Whether the dialog is visible. */
	open: boolean;
	/** Called when the dialog requests to close (Esc, backdrop, close button). */
	onClose: () => void;
	title?: string;
	description?: string;
	children?: ReactNode;
	footer?: ReactNode;
	/** Close when the backdrop is clicked. Defaults to true. */
	closeOnBackdrop?: boolean;
	/** Accessible label for the close button. Defaults to "Close". */
	closeLabel?: string;
	classNames?: DialogStyles;
}

const FOCUSABLE_SELECTOR = [
	"a[href]",
	"button:not([disabled])",
	"textarea:not([disabled])",
	"input:not([disabled])",
	"select:not([disabled])",
	'[tabindex]:not([tabindex="-1"])',
].join(",");

/** Base overlay z-index; each stacked dialog adds a step above the last. */
const Z_INDEX_BASE = 50;
const Z_INDEX_STEP = 10;

/** Must match the `dialog-zoom-out` animation duration in `main.css`. */
const EXIT_ANIMATION_DURATION_MS = 150;

function getExitAnimationDuration() {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	return prefersReducedMotion ? 0 : EXIT_ANIMATION_DURATION_MS;
}

/**
 * A modal dialog rendered in a portal. Traps focus while open, restores focus
 * to the previously focused element on close, locks body scroll, and closes on
 * Escape or backdrop click.
 */
export function Dialog({
	open,
	onClose,
	title,
	description,
	children,
	footer,
	size,
	closeOnBackdrop = true,
	closeLabel = "Close",
	classNames,
}: DialogProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const previouslyFocusedRef = useRef<HTMLElement | null>(null);
	const titleId = useId();
	const descriptionId = useId();
	const [prevOpen, setPrevOpen] = useState(open);
	const [isRendered, setIsRendered] = useState(open);
	const [isClosing, setIsClosing] = useState(false);

	if (open !== prevOpen) {
		setPrevOpen(open);

		if (open) {
			setIsRendered(true);
			setIsClosing(false);
		} else if (isRendered) {
			setIsClosing(true);
		}
	}

	// Keep closing dialogs in the stack until they unmount, so the dialog
	// underneath stays inert for the full duration of the exit animation.
	const { index: stackIndex, isTop } = useDialogStack(isRendered);

	useEffect(() => {
		if (!isClosing) {
			return;
		}

		const exitTimer = window.setTimeout(() => {
			setIsRendered(false);
			setIsClosing(false);
		}, getExitAnimationDuration());

		return () => window.clearTimeout(exitTimer);
	}, [isClosing]);

	useEffect(() => {
		if (!open) {
			return;
		}

		previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";

		// Move focus into the dialog once mounted.
		const focusTimer = window.setTimeout(() => {
			const target =
				panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
				panelRef.current;
			target?.focus();
		}, 0);

		return () => {
			window.clearTimeout(focusTimer);
			document.body.style.overflow = overflow;
			previouslyFocusedRef.current?.focus?.();
		};
	}, [open]);

	if (!isRendered) {
		return null;
	}

	function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		if (event.key === "Escape") {
			event.stopPropagation();
			onClose();
			return;
		}

		if (event.key !== "Tab" || !panelRef.current) {
			return;
		}

		const focusable = Array.from(
			panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
		);

		if (focusable.length === 0) {
			event.preventDefault();
			panelRef.current.focus();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
		if (closeOnBackdrop && event.target === event.currentTarget) {
			onClose();
		}
	}

	return (
		<Portal>
			<div
				className={overlay({
					className: classNames?.overlay,
				})}
				style={{
					zIndex: Z_INDEX_BASE + Math.max(stackIndex, 0) * Z_INDEX_STEP,
				}}
				inert={!isTop}
				onClick={handleOverlayClick}
				onKeyDown={handleKeyDown}
			>
				<div
					ref={panelRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby={title ? titleId : undefined}
					aria-describedby={description ? descriptionId : undefined}
					tabIndex={-1}
					className={panel({
						size,
						className: [
							isClosing ? "animate-dialog-zoom-out" : "animate-dialog-zoom-in",
							classNames?.panel,
						]
							.filter(Boolean)
							.join(" "),
					})}
				>
					<button
						type="button"
						aria-label={closeLabel}
						onClick={onClose}
						className={closeButton({ className: classNames?.closeButton })}
					>
						<XIcon size={18} />
					</button>
					{(title || description) && (
						<div className={header({ className: classNames?.header })}>
							{title && (
								<h2
									id={titleId}
									className={titleSlot({ className: classNames?.title })}
								>
									{title}
								</h2>
							)}
							{description && (
								<p
									id={descriptionId}
									className={descriptionSlot({
										className: classNames?.description,
									})}
								>
									{description}
								</p>
							)}
						</div>
					)}
					{children && (
						<div className={body({ className: classNames?.body })}>
							{children}
						</div>
					)}
					{footer && (
						<div className={footerSlot({ className: classNames?.footer })}>
							{footer}
						</div>
					)}
				</div>
			</div>
		</Portal>
	);
}
