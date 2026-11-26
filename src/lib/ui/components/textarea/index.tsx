import type { ChangeEvent, Ref, TextareaHTMLAttributes } from "react";
import type { TextareaStyles, TextareaVariants } from "./styles";

import { useId, useState } from "react";

import { styles } from "./styles";

export interface TextareaProps
	extends
		Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "size">,
		TextareaVariants {
	ref?: Ref<HTMLTextAreaElement>;
	label?: string;
	message?: string;
	classNames?: TextareaStyles;
}

export function Textarea({
	classNames,
	ref,
	label,
	id,
	message,
	size,
	isError = false,
	disabled,
	maxLength,
	value,
	defaultValue,
	onChange,
	"aria-describedby": ariaDescribedBy,
	...rest
}: TextareaProps) {
	const internalId = useId();
	const idToUse = id || internalId;
	const messageId = useId();
	const describedBy =
		[ariaDescribedBy, message ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;

	const isControlled = value !== undefined;
	const [internalLength, setInternalLength] = useState(
		() => String(defaultValue ?? "").length,
	);
	const charLength = isControlled ? String(value ?? "").length : internalLength;

	const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		if (!isControlled) {
			setInternalLength(event.target.value.length);
		}

		onChange?.(event);
	};

	const {
		root,
		labelText,
		baseContainer,
		inputContainer,
		textarea,
		footer,
		message: messageSlot,
		charCount,
	} = styles({ size, isError });

	const showCharCount = maxLength !== undefined;

	return (
		<div className={root({ className: classNames?.root })}>
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
						className: classNames?.inputContainer,
					})}
					data-disabled={disabled ? "true" : "false"}
				>
					<textarea
						id={idToUse}
						ref={ref}
						disabled={disabled}
						maxLength={maxLength}
						value={value}
						defaultValue={defaultValue}
						onChange={handleChange}
						aria-invalid={isError ? "true" : "false"}
						aria-describedby={describedBy}
						{...rest}
						className={textarea({ className: classNames?.textarea })}
					/>
				</div>
				<div className={footer({ className: classNames?.footer })}>
					<p
						id={messageId}
						aria-hidden={message ? false : true}
						className={messageSlot({ className: classNames?.message })}
					>
						{message}
					</p>
					{showCharCount && (
						<span
							className={charCount({
								className: [
									charLength >= maxLength ? "text-danger" : "",
									classNames?.charCount,
								]
									.filter(Boolean)
									.join(" "),
							})}
						>
							{charLength} / {maxLength}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
