import type { ComponentPropsWithRef, JSX, ReactNode } from "react";

import { Heading } from "@lib/ui/components/heading";
import { Text } from "@lib/ui/components/text";

import { styles } from "./styles";

export type PageHeaderProps = Omit<ComponentPropsWithRef<"header">, "title"> & {
	title: ReactNode;
	description?: ReactNode;
	/** A link back to the parent page, e.g. a router `Link`. */
	backLink?: ReactNode;
	/** Page-level actions shown next to the title. */
	actions?: ReactNode;
};

/**
 * The top of a page: an optional back link, the page's `h1`, an optional
 * description and optional actions aligned to the right on wider screens.
 */
export function PageHeader({
	title,
	description,
	backLink,
	actions,
	className,
	...rest
}: PageHeaderProps): JSX.Element {
	const {
		root,
		backLink: backLinkSlot,
		row,
		titleGroup,
		actions: actionsSlot,
	} = styles();

	return (
		<header {...rest} className={root({ className })}>
			{backLink && <div className={backLinkSlot()}>{backLink}</div>}
			<div className={row()}>
				<div className={titleGroup()}>
					<Heading level={1} size="lg">
						{title}
					</Heading>
					{description && <Text variant="muted">{description}</Text>}
				</div>
				{actions && <div className={actionsSlot()}>{actions}</div>}
			</div>
		</header>
	);
}
