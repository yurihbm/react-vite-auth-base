import type { InputHTMLAttributes, Ref } from "react";
import type { CheckboxStyles, CheckboxVariants } from "./styles";

import { CheckIcon, MinusIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";

import {
	box,
	control,
	indeterminateIndicator,
	indicator,
	inputWrapper,
	labelText,
	messageSlot,
	nativeInput,
	root,
} from "./styles";

export interface CheckboxProps
	extends
		Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size">,
		CheckboxVariants {
	ref?: Ref<HTMLInputElement>;
	label?: string;
	message?: string;
	/** Renders the box in a partially-selected state. */
	indeterminate?: boolean;
	classNames?: CheckboxStyles;
}

const ICON_SIZE = {
	sm: 12,
	md: 14,
} as const;

export function Checkbox({
	ref,
	label,
	id,
	message,
	indeterminate = false,
	size = "md",
	isError = false,
	disabled,
	classNames,
	"aria-describedby": ariaDescribedBy,
	...rest
}: CheckboxProps) {
	const internalId = useId();
	const idToUse = id || internalId;
	const messageId = useId();
	const inputRef = useRef<HTMLInputElement>(null);

	const describedBy =
		[ariaDescribedBy, message ? messageId : undefined]
			.filter(Boolean)
			.join(" ") || undefined;

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.indeterminate = indeterminate;
		}
	}, [indeterminate]);

	function assignRef(node: HTMLInputElement | null) {
		inputRef.current = node;

		if (typeof ref === "function") {
			ref(node);
		} else if (ref) {
			ref.current = node;
		}
	}

	const iconSize = ICON_SIZE[size ?? "md"];

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
						ref={assignRef}
						disabled={disabled}
						aria-invalid={isError ? "true" : "false"}
						aria-describedby={describedBy}
						{...rest}
						className={nativeInput({ className: classNames?.nativeInput })}
					/>
					<span
						aria-hidden="true"
						className={box({ size, isError, className: classNames?.box })}
					>
						<CheckIcon
							size={iconSize}
							weight="bold"
							className={indicator({ className: classNames?.indicator })}
						/>
						<MinusIcon
							size={iconSize}
							weight="bold"
							className={indeterminateIndicator({
								className: classNames?.indeterminateIndicator,
							})}
						/>
					</span>
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
					className={messageSlot({ isError, className: classNames?.message })}
				>
					{message}
				</p>
			)}
		</div>
	);
}
