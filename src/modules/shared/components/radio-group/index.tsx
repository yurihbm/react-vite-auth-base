import type { RadioGroupStyles, RadioGroupVariants } from "./styles";
import type { RadioOption } from "./types";

import { useId, useState } from "react";

import { styles } from "./styles";

export type { RadioOption };

export interface RadioGroupProps extends RadioGroupVariants {
	items: RadioOption[];
	name: string;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	label?: string;
	"aria-label"?: string;
	"aria-labelledby"?: string;
	message?: string;
	classNames?: RadioGroupStyles;
}

export function RadioGroup({
	items,
	name,
	value,
	defaultValue,
	onChange,
	label,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	message,
	size,
	isError = false,
	orientation,
	classNames,
}: RadioGroupProps) {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = useState(defaultValue ?? "");
	const activeValue = isControlled ? value : internalValue;

	const baseId = useId();
	const messageId = useId();

	const describedBy =
		[message ? messageId : undefined].filter(Boolean).join(" ") || undefined;

	const {
		root,
		legend,
		item,
		inputWrapper,
		nativeInput,
		indicator,
		dot,
		labelText,
		message: messageSlot,
	} = styles({ size, isError, orientation });

	return (
		<fieldset
			className={root({ className: classNames?.root })}
			aria-describedby={describedBy}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
		>
			{label && (
				<legend className={legend({ className: classNames?.legend })}>
					{label}
				</legend>
			)}
			{items.map((option, index) => {
				const inputId = `${baseId}-${index}`;

				return (
					<div
						key={option.value}
						className={item({ className: classNames?.item })}
					>
						<span
							className={inputWrapper({ className: classNames?.inputWrapper })}
						>
							<input
								id={inputId}
								type="radio"
								name={name}
								value={option.value}
								checked={activeValue === option.value}
								disabled={option.disabled}
								aria-invalid={isError ? "true" : "false"}
								onChange={() => {
									if (!isControlled) {
										setInternalValue(option.value);
									}

									onChange?.(option.value);
								}}
								className={nativeInput({ className: classNames?.nativeInput })}
							/>
							<span
								aria-hidden="true"
								className={indicator({ className: classNames?.indicator })}
							>
								<span className={dot({ className: classNames?.dot })} />
							</span>
						</span>
						<label
							htmlFor={inputId}
							className={labelText({ className: classNames?.labelText })}
						>
							{option.label}
						</label>
					</div>
				);
			})}
			<p
				id={messageId}
				aria-hidden={!message}
				className={messageSlot({ className: classNames?.message })}
			>
				{message}
			</p>
		</fieldset>
	);
}
