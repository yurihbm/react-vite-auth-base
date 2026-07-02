import type { ReactNode } from "react";
import type { ProgressBarStyles, ProgressBarVariants } from "./styles";

import { styles } from "./styles";

export interface ProgressBarProps extends ProgressBarVariants {
	value?: number;
	max?: number;
	label?: ReactNode;
	showValue?: boolean;
	className?: string;
	classNames?: ProgressBarStyles;
}

export function ProgressBar({
	value = 0,
	max = 100,
	label,
	showValue,
	size,
	color,
	indeterminate,
	className,
	classNames,
}: ProgressBarProps) {
	const clampedValue = Math.min(max, Math.max(0, value));
	const percentage = (clampedValue / max) * 100;

	const {
		root,
		label: labelSlot,
		track,
		indicator,
	} = styles({ size, color, indeterminate });

	return (
		<div className={root({ class: [classNames?.root, className] })}>
			{(label || showValue) && (
				<div className={labelSlot({ class: classNames?.label })}>
					{label && <span>{label}</span>}
					{showValue && !indeterminate && (
						<span>{Math.round(percentage)}%</span>
					)}
				</div>
			)}
			<div
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={max}
				aria-valuenow={indeterminate ? undefined : clampedValue}
				className={track({ class: classNames?.track })}
			>
				<div
					className={indicator({ class: classNames?.indicator })}
					style={indeterminate ? undefined : { width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}
