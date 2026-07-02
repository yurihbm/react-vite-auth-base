import type { HTMLAttributes, ReactNode, Ref } from "react";
import type { CardStyles, CardVariants } from "./styles";

import { styles } from "./styles";

export interface CardProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "className">, CardVariants {
	ref?: Ref<HTMLDivElement>;
	header?: ReactNode;
	footer?: ReactNode;
	className?: string;
	classNames?: CardStyles;
}

export function Card({
	ref,
	header,
	footer,
	padding,
	className,
	classNames,
	children,
	...rest
}: CardProps) {
	const {
		root,
		header: headerSlot,
		body,
		footer: footerSlot,
	} = styles({
		padding,
	});

	return (
		<div
			ref={ref}
			className={root({ class: [classNames?.root, className] })}
			{...rest}
		>
			{header && (
				<div className={headerSlot({ class: classNames?.header })}>
					{header}
				</div>
			)}
			<div className={body({ class: classNames?.body })}>{children}</div>
			{footer && (
				<div className={footerSlot({ class: classNames?.footer })}>
					{footer}
				</div>
			)}
		</div>
	);
}
