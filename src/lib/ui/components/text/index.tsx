import type { ComponentPropsWithRef, ElementType, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type TextProps<E extends ElementType> = ComponentPropsWithRef<E> &
	VariantProps<typeof styles> & {
		as?: E;
	};

/**
 * Body copy from the type scale: `body` for content, `muted` for supporting
 * text, `caption` for small print and `label` for field-like labels. Renders a
 * `p` by default but can render any element via the `as` prop.
 *
 * @template E - The type of the HTML element to render, defaulting to "p".
 */
export function Text<E extends ElementType = "p">({
	as,
	variant,
	className,
	...rest
}: TextProps<E>): JSX.Element {
	const Component = as ?? "p";

	return <Component {...rest} className={styles({ className, variant })} />;
}
