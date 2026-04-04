import type { ComponentPropsWithRef, ElementType, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type ButtonProps<E extends ElementType> = ComponentPropsWithRef<E> &
	VariantProps<typeof styles> & {
		as?: E;
	};

/**
 * A versatile Button component that can render as different HTML elements based
 * on the `as` prop.
 *
 * @template E - The type of the HTML element to render, defaulting to "button".
 * @param {ButtonProps<E>} props - The props for the Button component, including
 * the `as` prop to specify the element type and any additional props.
 *
 * @returns {JSX.Element} The rendered Button component as the specified element type.
 */
export function Button<E extends ElementType = "button">({
	as = "button",
	color,
	className,
	size,
	...rest
}: ButtonProps<E>): JSX.Element {
	const Component = as;

	return <Component {...rest} className={styles({ className, color, size })} />;
}
