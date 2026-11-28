import type { HTMLAttributes, ReactNode, Ref } from "react";
import type { AlertStyles, AlertVariants } from "./styles";

import {
	CheckCircleIcon,
	InfoIcon,
	WarningIcon,
	XCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { styles } from "./styles";

const ICON_MAP = {
	info: InfoIcon,
	success: CheckCircleIcon,
	warning: WarningIcon,
	danger: XCircleIcon,
} as const;

export interface AlertProps
	extends
		Omit<
			HTMLAttributes<HTMLDivElement>,
			"className" | "color" | "role" | "title"
		>,
		AlertVariants {
	ref?: Ref<HTMLDivElement>;
	/** @deprecated Use `color` instead. */
	type?: AlertVariants["color"];
	title?: ReactNode;
	description?: ReactNode;
	isDismissible?: boolean;
	onDismiss?: () => void;
	classNames?: AlertStyles;
}

export function Alert({
	ref,
	color,
	type,
	title,
	description,
	isDismissible,
	onDismiss,
	classNames,
	...rest
}: AlertProps) {
	const [dismissed, setDismissed] = useState(false);
	const resolvedColor = color ?? type ?? "info";

	const {
		root,
		icon,
		body,
		title: titleSlot,
		description: descriptionSlot,
		dismissButton,
	} = styles({ color: resolvedColor });

	const IconComponent = ICON_MAP[resolvedColor];
	const showDismiss = isDismissible || !!onDismiss;

	if (dismissed) return null;

	const handleDismiss = () => {
		setDismissed(true);
		onDismiss?.();
	};

	return (
		<div
			ref={ref}
			role="alert"
			className={root({ class: classNames?.root })}
			{...rest}
		>
			<IconComponent size={20} className={icon({ class: classNames?.icon })} />

			{(title || description) && (
				<div className={body({ class: classNames?.body })}>
					{title && (
						<span className={titleSlot({ class: classNames?.title })}>
							{title}
						</span>
					)}
					{description && (
						<span
							className={descriptionSlot({
								class: classNames?.description,
							})}
						>
							{description}
						</span>
					)}
				</div>
			)}

			{showDismiss && (
				<button
					type="button"
					aria-label="Dismiss"
					onClick={handleDismiss}
					className={dismissButton({
						class: classNames?.dismissButton,
					})}
				>
					<XIcon size={16} />
				</button>
			)}
		</div>
	);
}
