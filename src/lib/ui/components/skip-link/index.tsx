import type { ComponentPropsWithRef, JSX } from "react";

import { styles } from "./styles";

export type SkipLinkProps = ComponentPropsWithRef<"a"> & {
	/** The id of the main content, as a fragment (e.g. `#main-content`). */
	href: string;
};

/**
 * The first focusable element of the page: hidden until focused, it lets
 * keyboard users jump past the navigation to the main content.
 */
export function SkipLink({ className, ...rest }: SkipLinkProps): JSX.Element {
	return <a {...rest} className={styles({ className })} />;
}
