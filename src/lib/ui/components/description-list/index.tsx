import type { ComponentPropsWithRef, JSX, ReactNode } from "react";

import { styles } from "./styles";

export interface DescriptionListItem {
	label: ReactNode;
	value: ReactNode;
}

export type DescriptionListProps = ComponentPropsWithRef<"dl"> & {
	items: DescriptionListItem[];
};

/**
 * Label and value pairs, such as profile details. Each pair stacks on small
 * screens and sits in two columns from the `sm` breakpoint.
 */
export function DescriptionList({
	items,
	className,
	...rest
}: DescriptionListProps): JSX.Element {
	const { root, item, label, value } = styles();

	return (
		<dl {...rest} className={root({ className })}>
			{items.map((entry, index) => (
				<div className={item()} key={index}>
					<dt className={label()}>{entry.label}</dt>
					<dd className={value()}>{entry.value}</dd>
				</div>
			))}
		</dl>
	);
}
