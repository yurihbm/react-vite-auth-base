import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import type { TextInputStyles, TextInputVariants } from "./styles";

import { useId } from "react";

import {
	baseContainer,
	innerInput,
	inputContainer,
	inputMessage,
	labelContainer,
	labelText,
} from "./styles";

export interface TextInputProps
	extends
		Omit<
			InputHTMLAttributes<HTMLInputElement>,
			"type" | "className" | "color" | "size"
		>,
		TextInputVariants {
	type?: "text" | "email" | "password";
	ref?: Ref<HTMLInputElement>;
	startIcon?: ReactNode;
	endIcon?: ReactNode;
	classNames?: TextInputStyles;
	label?: string;
	message?: string;
}

export function TextInput({
	type = "text",
	classNames,
	ref,
	label,
	id,
	startIcon,
	endIcon,
	message,
	color,
	size,
	isError = false,
	isSuccess = false,
	disabled,
	"aria-describedby": ariaDescribedBy,
	...rest
}: TextInputProps) {
	const internalId = useId();
	const idToUse = id || internalId;
	const messageId = useId();
	const describedBy =
		[ariaDescribedBy, message ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;

	return (
		<div
			className={labelContainer({
				className: classNames?.labelContainer,
			})}
		>
			{label && (
				<label
					htmlFor={idToUse}
					className={labelText({ className: classNames?.labelText })}
				>
					{label}
				</label>
			)}
			<div
				className={baseContainer({
					className: classNames?.baseContainer,
				})}
			>
				<div
					className={inputContainer({
						size,
						color,
						isError,
						isSuccess,
						className: classNames?.inputContainer,
					})}
					data-disabled={disabled ? "true" : "false"}
				>
					{startIcon}
					<input
						id={idToUse}
						type={type}
						ref={ref}
						disabled={disabled}
						aria-invalid={isError ? "true" : "false"}
						aria-describedby={describedBy}
						{...rest}
						className={innerInput({ size, className: classNames?.innerInput })}
					/>
					{endIcon}
				</div>
				{message && (
					<p
						id={messageId}
						className={inputMessage({
							isError,
							isSuccess,
							className: classNames?.inputMessage,
						})}
					>
						{message}
					</p>
				)}
			</div>
		</div>
	);
}
