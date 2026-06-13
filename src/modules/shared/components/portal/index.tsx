import type { ReactNode } from "react";

import { createPortal } from "react-dom";

export interface PortalProps {
	children: ReactNode;
	/**
	 * The DOM node to render the portal into. Defaults to `document.body`.
	 */
	container?: Element | null;
}

/**
 * Renders its children into a different part of the DOM tree using a React
 * portal. Defaults to `document.body`.
 */
export function Portal({ children, container }: PortalProps) {
	return createPortal(children, container ?? document.body);
}
