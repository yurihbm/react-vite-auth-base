import type { ComponentPropsWithRef, ElementType, JSX, ReactNode } from "react";

import { styles } from "./styles";

export type EmptyStateProps = Omit<ComponentPropsWithRef<"div">, "title"> & {
	title: ReactNode;
	description?: ReactNode;
	/** A call to action, e.g. a button that clears the filters. */
	action?: ReactNode;
	/** A decorative icon shown above the title. */
	icon?: ReactNode;
	/** The title's element, e.g. `h1` when the empty state is the whole page. */
	titleAs?: ElementType;
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
	titleAs: Title = "p",
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
			<Title className={titleSlot()}>{title}</Title>
			{description && <p className={descriptionSlot()}>{description}</p>}
			{action && <div className={actionSlot()}>{action}</div>}
		</div>
	);
}
