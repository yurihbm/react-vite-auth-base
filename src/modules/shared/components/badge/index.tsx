import type { ComponentPropsWithRef, ElementType, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type BadgeProps<E extends ElementType> = ComponentPropsWithRef<E> &
	VariantProps<typeof styles> & {
		as?: E;
	};

/**
 * A small label used to highlight status, counts, or categories. Renders as a
 * `span` by default but can render any element via the `as` prop.
 *
 * @template E - The type of the HTML element to render, defaulting to "span".
 */
export function Badge<E extends ElementType = "span">({
	as,
	color,
	size,
	className,
	...rest
}: BadgeProps<E>): JSX.Element {
	const Component = as ?? "span";

	return <Component {...rest} className={styles({ className, color, size })} />;
}
