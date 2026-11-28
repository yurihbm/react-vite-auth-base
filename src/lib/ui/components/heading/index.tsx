import type { ComponentPropsWithRef, ElementType, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

type HeadingSize = NonNullable<VariantProps<typeof styles>["size"]>;

export type HeadingLevel = 1 | 2 | 3 | 4;

export type HeadingProps<E extends ElementType> = ComponentPropsWithRef<E> &
	VariantProps<typeof styles> & {
		as?: E;
		level?: HeadingLevel;
	};

const SIZE_BY_LEVEL: Record<HeadingLevel, HeadingSize> = {
	1: "xl",
	2: "lg",
	3: "md",
	4: "sm",
};

/**
 * A section heading. `level` picks the element (`h1` to `h4`) and its default
 * size; `size` changes the look without changing the document outline, and `as`
 * renders any other element.
 *
 * @template E - The type of the HTML element to render, defaulting to the
 *   heading element for `level`.
 */
export function Heading<E extends ElementType = "h2">({
	as,
	level = 2,
	size,
	className,
	...rest
}: HeadingProps<E>): JSX.Element {
	// `level` is loosely typed through the polymorphic props; pin it here.
	const headingLevel: HeadingLevel = level;
	const Component = as ?? (`h${headingLevel}` as const);

	return (
		<Component
			{...rest}
			className={styles({
				className,
				size: size ?? SIZE_BY_LEVEL[headingLevel],
			})}
		/>
	);
}
