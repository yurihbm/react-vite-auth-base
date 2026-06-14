import type { ToastContextValue } from "./types";

import { useContext } from "react";

import { ToastContext } from "./context";

/**
 * Access the toast API. Must be used within a `ToastProvider`.
 *
 * @example
 * const { toast } = useToast();
 * toast({ title: "Saved", color: "success" });
 */
export function useToast(): ToastContextValue {
	const context = useContext(ToastContext);

	if (!context) {
		throw new Error("useToast must be used within a ToastProvider.");
	}

	return context;
}
