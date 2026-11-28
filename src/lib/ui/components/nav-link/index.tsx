import type { ComponentPropsWithRef, ElementType, JSX } from "react";

import { styles } from "./styles";

export type NavLinkProps<E extends ElementType> = ComponentPropsWithRef<E> & {
	as?: E;
};

/**
 * A navigation link for the app bar. The current page is styled through
 * `aria-current="page"`, which router links set when active. Renders an `a` by
 * default; pass a router link (or a `button`) through `as`.
 *
 * @template E - The type of the element to render, defaulting to "a".
 */
export function NavLink<E extends ElementType = "a">({
	as,
	className,
	...rest
}: NavLinkProps<E>): JSX.Element {
	const Component = as ?? "a";

	return <Component {...rest} className={styles({ className })} />;
}
