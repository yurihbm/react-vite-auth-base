import type { ComponentPropsWithRef, JSX, ReactNode } from "react";

import { styles } from "./styles";

export type DividerProps = ComponentPropsWithRef<"hr"> & {
	/** Text shown between two lines, e.g. "or" between sign-in options. */
	label?: ReactNode;
};

/**
 * A horizontal rule. With a `label` it renders the text between two decorative
 * lines so screen readers read the label instead of a separator.
 */
export function Divider({
	label,
	className,
	...rest
}: DividerProps): JSX.Element {
	const { root, labelled, line, label: labelSlot } = styles();

	if (label === undefined) {
		return <hr {...rest} className={root({ className })} />;
	}

	return (
		<div
			{...(rest as ComponentPropsWithRef<"div">)}
			className={labelled({ className })}
		>
			<span aria-hidden="true" className={line()} />
			<span className={labelSlot()}>{label}</span>
			<span aria-hidden="true" className={line()} />
		</div>
	);
}
