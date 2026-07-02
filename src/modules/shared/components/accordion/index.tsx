import type { KeyboardEvent } from "react";
import type { AccordionStyles, AccordionVariants } from "./styles";
import type { AccordionItem } from "./types";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useId, useRef, useState } from "react";

import { styles } from "./styles";

export type { AccordionItem };

export interface AccordionProps extends AccordionVariants {
	items: AccordionItem[];
	type?: "single" | "multiple";
	value?: string[];
	defaultValue?: string[];
	onChange?: (value: string[]) => void;
	className?: string;
	classNames?: AccordionStyles;
}

export function Accordion({
	items,
	type = "single",
	value: controlledValue,
	defaultValue,
	onChange,
	size,
	className,
	classNames,
}: AccordionProps) {
	const isControlled = controlledValue !== undefined;
	const [internalValue, setInternalValue] = useState(defaultValue ?? []);

	const openValues = isControlled ? controlledValue : internalValue;

	const baseId = useId();
	const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);

	function toggle(itemValue: string) {
		const isOpen = openValues.includes(itemValue);
		const nextValue =
			type === "multiple"
				? isOpen
					? openValues.filter((v) => v !== itemValue)
					: [...openValues, itemValue]
				: isOpen
					? []
					: [itemValue];

		if (!isControlled) {
			setInternalValue(nextValue);
		}

		onChange?.(nextValue);
	}

	function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
		const enabledIndices = items
			.map((item, i) => (item.disabled ? null : i))
			.filter((i): i is number => i !== null);

		if (enabledIndices.length === 0) return;

		const pos = enabledIndices.indexOf(index);
		const len = enabledIndices.length;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			headerRefs.current[enabledIndices[(pos + 1) % len]]?.focus();
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			headerRefs.current[enabledIndices[(pos - 1 + len) % len]]?.focus();
		} else if (e.key === "Home") {
			e.preventDefault();
			headerRefs.current[enabledIndices[0]]?.focus();
		} else if (e.key === "End") {
			e.preventDefault();
			headerRefs.current[enabledIndices[len - 1]]?.focus();
		}
	}

	const {
		root,
		item: itemSlot,
		header,
		trigger,
		icon,
		panel,
		panelInner,
	} = styles({ size });

	return (
		<div className={root({ class: [classNames?.root, className] })}>
			{items.map((item, index) => {
				const headerId = `${baseId}-header-${item.value}`;
				const panelId = `${baseId}-panel-${item.value}`;
				const isOpen = openValues.includes(item.value);

				return (
					<div
						key={item.value}
						className={itemSlot({ class: classNames?.item })}
					>
						<div className={header({ class: classNames?.header })}>
							<button
								id={headerId}
								type="button"
								ref={(el) => {
									headerRefs.current[index] = el;
								}}
								aria-expanded={isOpen}
								aria-controls={panelId}
								aria-disabled={item.disabled || undefined}
								className={trigger({ class: classNames?.trigger })}
								onClick={() => {
									if (!item.disabled) {
										toggle(item.value);
									}
								}}
								onKeyDown={(e) => handleKeyDown(e, index)}
							>
								{item.title}
								<CaretDownIcon
									size={16}
									className={icon({
										class: [isOpen && "rotate-180", classNames?.icon],
									})}
								/>
							</button>
						</div>
						{isOpen && (
							<div
								id={panelId}
								role="region"
								aria-labelledby={headerId}
								className={panel({ class: classNames?.panel })}
							>
								<div className={panelInner({ class: classNames?.panelInner })}>
									{item.content}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
