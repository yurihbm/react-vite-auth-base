import type { ToastColor } from "./styles";

export interface ToastOptions {
	title: string;
	description?: string;
	color?: ToastColor;
	/** Auto-dismiss delay in milliseconds. Set to 0 to disable. Defaults to 5000. */
	duration?: number;
}

export interface Toast extends ToastOptions {
	id: string;
}

export interface ToastContextValue {
	toasts: Toast[];
	/** Show a toast and return its generated id. */
	toast: (options: ToastOptions) => string;
	/** Dismiss a toast by id. */
	dismiss: (id: string) => void;
}
