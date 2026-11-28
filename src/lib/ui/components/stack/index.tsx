import type { ComponentPropsWithRef, ElementType, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type StackProps<E extends ElementType> = ComponentPropsWithRef<E> &
	VariantProps<typeof styles> & {
		as?: E;
	};

/**
 * Lays out its children in a column with a gap from the spacing scale. Renders
 * a `div` by default but can render any element via the `as` prop.
 *
 * @template E - The type of the HTML element to render, defaulting to "div".
 */
export function Stack<E extends ElementType = "div">({
	as,
	gap,
	className,
	...rest
}: StackProps<E>): JSX.Element {
	const Component = as ?? "div";

	return <Component {...rest} className={styles({ className, gap })} />;
}
