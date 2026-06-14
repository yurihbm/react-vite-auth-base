import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import type { DialogStyles, DialogVariants } from "./styles";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";

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

	if (!open) {
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
				className={overlay({ className: classNames?.overlay })}
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
					className={panel({ size, className: classNames?.panel })}
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
