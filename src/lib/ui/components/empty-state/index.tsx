import type { ComponentPropsWithRef, JSX, ReactNode } from "react";

import { styles } from "./styles";

export type EmptyStateProps = Omit<ComponentPropsWithRef<"div">, "title"> & {
	title: ReactNode;
	description?: ReactNode;
	/** A call to action, e.g. a button that clears the filters. */
	action?: ReactNode;
	/** A decorative icon shown above the title. */
	icon?: ReactNode;
};

/**
 * Shown in place of content that has nothing to display yet, such as an empty
 * list or a search without results.
 */
export function EmptyState({
	title,
	description,
	action,
	icon,
	className,
	...rest
}: EmptyStateProps): JSX.Element {
	const {
		root,
		icon: iconSlot,
		title: titleSlot,
		description: descriptionSlot,
		action: actionSlot,
	} = styles();

	return (
		<div {...rest} className={root({ className })}>
			{icon && (
				<div aria-hidden="true" className={iconSlot()}>
					{icon}
				</div>
			)}
			<p className={titleSlot()}>{title}</p>
			{description && <p className={descriptionSlot()}>{description}</p>}
			{action && <div className={actionSlot()}>{action}</div>}
		</div>
	);
}
