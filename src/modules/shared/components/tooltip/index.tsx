import type { ReactElement, ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import { cloneElement, useId, useState } from "react";

import { styles } from "./styles";

export interface TooltipProps extends VariantProps<typeof styles> {
	content: ReactNode;
	children: ReactElement;
}

export function Tooltip({ content, side = "top", children }: TooltipProps) {
	const [visible, setVisible] = useState(false);
	const tooltipId = useId();

	const { wrapper, content: contentClass } = styles({ side });

	const existingDescribedBy = (children.props as Record<string, unknown>)[
		"aria-describedby"
	] as string | undefined;
	const ariaDescribedBy = visible
		? [existingDescribedBy, tooltipId].filter(Boolean).join(" ")
		: existingDescribedBy;

	const trigger = cloneElement(children, {
		"aria-describedby": ariaDescribedBy || undefined,
	} as Record<string, unknown>);

	return (
		<span
			className={wrapper()}
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
			onFocus={() => setVisible(true)}
			onBlur={() => setVisible(false)}
		>
			{trigger}
			{visible && (
				<div id={tooltipId} role="tooltip" className={contentClass()}>
					{content}
				</div>
			)}
		</span>
	);
}
