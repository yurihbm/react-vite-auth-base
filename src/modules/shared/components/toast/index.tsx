import type { ReactNode } from "react";
import type { ToastPosition } from "./styles";
import type { Toast, ToastContextValue, ToastOptions } from "./types";

import { XIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Portal } from "../portal";
import { ToastContext } from "./context";
import {
	closeButton,
	content,
	descriptionSlot,
	root,
	titleSlot,
	viewportStyles,
} from "./styles";

export interface ToastProviderProps {
	children: ReactNode;
	/** Corner the toasts stack in. Defaults to "bottom-right". */
	position?: ToastPosition;
	/** Default auto-dismiss delay in ms when a toast omits one. Defaults to 5000. */
	defaultDuration?: number;
	/** Accessible label for each toast's close button. Defaults to "Dismiss". */
	closeLabel?: string;
}

let toastCounter = 0;

function ToastItem({
	toast,
	onDismiss,
	closeLabel,
}: {
	toast: Toast;
	onDismiss: (id: string) => void;
	closeLabel: string;
}) {
	const { id, duration = 5000 } = toast;

	useEffect(() => {
		if (duration <= 0) {
			return;
		}

		const timeoutId = window.setTimeout(() => onDismiss(id), duration);

		return () => window.clearTimeout(timeoutId);
	}, [id, duration, onDismiss]);

	return (
		<div
			role="status"
			aria-live="polite"
			className={root({ color: toast.color })}
		>
			<div className={content()}>
				<p className={titleSlot()}>{toast.title}</p>
				{toast.description && (
					<p className={descriptionSlot()}>{toast.description}</p>
				)}
			</div>
			<button
				type="button"
				aria-label={closeLabel}
				onClick={() => onDismiss(id)}
				className={closeButton()}
			>
				<XIcon size={16} />
			</button>
		</div>
	);
}

/**
 * Provides the toast API to descendants and renders the toast viewport in a
 * portal. Wrap the app once near the root, then call `useToast()` anywhere.
 */
export function ToastProvider({
	children,
	position = "bottom-right",
	defaultDuration = 5000,
	closeLabel = "Dismiss",
}: ToastProviderProps) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const toast = useCallback(
		(options: ToastOptions) => {
			const id = `toast-${++toastCounter}`;

			setToasts((current) => [
				...current,
				{ ...options, duration: options.duration ?? defaultDuration, id },
			]);

			return id;
		},
		[defaultDuration],
	);

	const value = useMemo<ToastContextValue>(
		() => ({ toasts, toast, dismiss }),
		[toasts, toast, dismiss],
	);

	return (
		<ToastContext.Provider value={value}>
			{children}
			{toasts.length > 0 && (
				<Portal>
					<div className={viewportStyles({ position })}>
						{toasts.map((item) => (
							<ToastItem
								key={item.id}
								toast={item}
								onDismiss={dismiss}
								closeLabel={closeLabel}
							/>
						))}
					</div>
				</Portal>
			)}
		</ToastContext.Provider>
	);
}
