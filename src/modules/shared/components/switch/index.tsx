import type { InputHTMLAttributes, Ref } from "react";
import type { SwitchStyles, SwitchVariants } from "./styles";

import { useId } from "react";

import {
	control,
	inputWrapper,
	labelText,
	nativeInput,
	root,
	switchMessage,
	thumb,
	track,
} from "./styles";

export interface SwitchProps
	extends
		Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size">,
		SwitchVariants {
	ref?: Ref<HTMLInputElement>;
	label?: string;
	message?: string;
	classNames?: SwitchStyles;
}

export function Switch({
	ref,
	label,
	id,
	message,
	size = "md",
	isError = false,
	disabled,
	classNames,
	"aria-describedby": ariaDescribedBy,
	...rest
}: SwitchProps) {
	const internalId = useId();
	const idToUse = id ?? internalId;
	const messageId = useId();

	const describedBy =
		[ariaDescribedBy, message ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;

	return (
		<div className={root({ className: classNames?.root })}>
			<div className={control({ className: classNames?.control })}>
				<span
					className={inputWrapper({
						size,
						className: classNames?.inputWrapper,
					})}
				>
					<input
						id={idToUse}
						type="checkbox"
						ref={ref}
						disabled={disabled}
						aria-invalid={isError ? "true" : "false"}
						aria-describedby={describedBy}
						{...rest}
						className={nativeInput({ className: classNames?.nativeInput })}
					/>
					<span
						aria-hidden="true"
						className={track({
							isError,
							className: classNames?.track,
						})}
					/>
					<span
						aria-hidden="true"
						className={thumb({ size, className: classNames?.thumb })}
					/>
				</span>
				{label && (
					<label
						htmlFor={idToUse}
						className={labelText({ className: classNames?.labelText })}
					>
						{label}
					</label>
				)}
			</div>
			{message && (
				<p
					id={messageId}
					className={switchMessage({
						isError,
						className: classNames?.switchMessage,
					})}
				>
					{message}
				</p>
			)}
		</div>
	);
}
