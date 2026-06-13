import type { ComponentPropsWithRef, JSX } from "react";
import type { VariantProps } from "tailwind-variants";

import { styles } from "./styles";

export type SpinnerProps = Omit<
	ComponentPropsWithRef<"span">,
	"color" | "children"
> &
	VariantProps<typeof styles> & {
		/** Accessible label announced to assistive tech. Defaults to "Loading". */
		label?: string;
	};

/**
 * An animated loading indicator. Exposes a `status` role with an accessible
 * label so screen readers announce the loading state.
 */
export function Spinner({
	color,
	size,
	label = "Loading",
	className,
	...rest
}: SpinnerProps): JSX.Element {
	return (
		<span role="status" aria-label={label} {...rest}>
			<span className={styles({ className, color, size })} />
		</span>
	);
}
