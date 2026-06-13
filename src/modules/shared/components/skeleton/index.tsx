import type { ComponentPropsWithRef, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type SkeletonProps = ComponentPropsWithRef<"div"> &
	VariantProps<typeof styles>;

/**
 * A placeholder shimmer used while content is loading. Set dimensions via
 * `className` or inline `style`. Hidden from assistive technology.
 */
export function Skeleton({
	variant,
	className,
	...rest
}: SkeletonProps): JSX.Element {
	return (
		<div
			aria-hidden="true"
			{...rest}
			className={styles({ className, variant })}
		/>
	);
}
