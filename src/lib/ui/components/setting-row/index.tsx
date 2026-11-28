import type { ComponentPropsWithRef, JSX, ReactNode } from "react";

import { Heading } from "@lib/ui/components/heading";
import { Text } from "@lib/ui/components/text";

import { styles } from "./styles";

export type SettingRowProps = Omit<ComponentPropsWithRef<"div">, "title"> & {
	title: ReactNode;
	description?: ReactNode;
	/** The control that changes the setting, e.g. a form or a button. */
	children: ReactNode;
};

/**
 * One setting in a settings card: its name (h3) and description on the left,
 * the control on the right from `md`, stacked below that. Separate rows with
 * `divide-y` on the container.
 */
export function SettingRow({
	title,
	description,
	children,
	className,
	...rest
}: SettingRowProps): JSX.Element {
	const { root, text, action } = styles();

	return (
		<div {...rest} className={root({ className })}>
			<div className={text()}>
				<Heading level={3} size="xs">
					{title}
				</Heading>
				{description && <Text variant="muted">{description}</Text>}
			</div>
			<div className={action()}>{children}</div>
		</div>
	);
}
