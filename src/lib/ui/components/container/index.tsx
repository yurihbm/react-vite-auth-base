import type { ComponentPropsWithRef, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type ContainerProps = ComponentPropsWithRef<"div"> &
	VariantProps<typeof styles>;

/**
 * Centers page content with the app's horizontal page padding and a maximum
 * width: `narrow` for single forms, `default` for content pages and `wide` for
 * tables and dashboards.
 */
export function Container({
	size,
	className,
	...rest
}: ContainerProps): JSX.Element {
	return <div {...rest} className={styles({ className, size })} />;
}
