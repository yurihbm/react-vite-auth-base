import type { ComponentPropsWithRef, ElementType, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type InlineProps<E extends ElementType> = ComponentPropsWithRef<E> &
	VariantProps<typeof styles> & {
		as?: E;
	};

/**
 * Lays out its children in a wrapping row, vertically centered, with a gap from
 * the spacing scale. Renders a `div` by default but can render any element via
 * the `as` prop.
 *
 * @template E - The type of the HTML element to render, defaulting to "div".
 */
export function Inline<E extends ElementType = "div">({
	as,
	gap,
	className,
	...rest
}: InlineProps<E>): JSX.Element {
	const Component = as ?? "div";

	return <Component {...rest} className={styles({ className, gap })} />;
}
