import type { KeyboardEvent } from "react";
import type { TabsVariants } from "./styles";
import type { TabItem } from "./types";

import { useId, useRef, useState } from "react";

import { styles } from "./styles";

export type { TabItem };

export interface TabsProps extends TabsVariants {
	items: TabItem[];
	defaultValue?: string;
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
}

export function Tabs({
	items,
	defaultValue,
	value: controlledValue,
	onChange,
	size,
	className,
}: TabsProps) {
	const isControlled = controlledValue !== undefined;
	const [internalValue, setInternalValue] = useState(
		defaultValue ?? items[0]?.value ?? "",
	);

	const activeValue = isControlled ? controlledValue : internalValue;

	const baseId = useId();
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

	function select(value: string) {
		if (!isControlled) {
			setInternalValue(value);
		}

		onChange?.(value);
	}

	function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
		const enabledIndices = items
			.map((item, i) => (item.disabled ? null : i))
			.filter((i): i is number => i !== null);

		if (enabledIndices.length === 0) return;

		const pos = enabledIndices.indexOf(index);
		const len = enabledIndices.length;

		if (e.key === "ArrowRight") {
			e.preventDefault();
			tabRefs.current[enabledIndices[(pos + 1) % len]]?.focus();
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			tabRefs.current[enabledIndices[(pos - 1 + len) % len]]?.focus();
		} else if (e.key === "Home") {
			e.preventDefault();
			tabRefs.current[enabledIndices[0]]?.focus();
		} else if (e.key === "End") {
			e.preventDefault();
			tabRefs.current[enabledIndices[len - 1]]?.focus();
		}
	}

	const { root, tablist, tab, panel } = styles({ size });

	return (
		<div className={root({ className })}>
			<div role="tablist" className={tablist()}>
				{items.map((item, index) => {
					const tabId = `${baseId}-tab-${item.value}`;
					const panelId = `${baseId}-panel-${item.value}`;
					const isSelected = item.value === activeValue;

					return (
						<button
							key={item.value}
							id={tabId}
							role="tab"
							type="button"
							ref={(el) => {
								tabRefs.current[index] = el;
							}}
							aria-selected={isSelected}
							aria-controls={panelId}
							tabIndex={isSelected ? 0 : -1}
							aria-disabled={item.disabled || undefined}
							className={tab()}
							onClick={() => {
								if (!item.disabled) {
									select(item.value);
								}
							}}
							onKeyDown={(e) => handleKeyDown(e, index)}
						>
							{item.label}
						</button>
					);
				})}
			</div>
			{items.map((item) => {
				const tabId = `${baseId}-tab-${item.value}`;
				const panelId = `${baseId}-panel-${item.value}`;
				const isSelected = item.value === activeValue;

				if (!isSelected) {
					return null;
				}

				return (
					<div
						key={item.value}
						id={panelId}
						role="tabpanel"
						aria-labelledby={tabId}
						tabIndex={0}
						className={panel()}
					>
						{item.content}
					</div>
				);
			})}
		</div>
	);
}
