import type { ComponentPropsWithRef, JSX } from "react";

import { WarningCircleIcon } from "@phosphor-icons/react";

import { styles } from "./styles";

export type InlineErrorProps = Omit<ComponentPropsWithRef<"p">, "role">;

/**
 * A short error message shown next to the content it is about, such as a failed
 * load inside a card. It is announced as soon as it renders.
 */
export function InlineError({
	className,
	children,
	...rest
}: InlineErrorProps): JSX.Element {
	const { root, icon } = styles();

	return (
		<p {...rest} className={root({ className })} role="alert">
			<WarningCircleIcon aria-hidden="true" className={icon()} size={16} />
			{children}
		</p>
	);
}
