import type { OptionListStyles, OptionListVariants } from "./styles";
import type { SelectOption } from "./types";

import { CheckIcon } from "@phosphor-icons/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

import { Checkbox } from "../checkbox";
import { checkIcon, empty, listbox, optionSlot } from "./styles";

export interface OptionListProps extends OptionListVariants {
	options: SelectOption[];
	/** Returns whether a given option is currently selected. */
	getIsSelected: (option: SelectOption) => boolean;
	/** Index of the keyboard-highlighted option, or -1 for none. */
	activeIndex: number;
	onSelect: (option: SelectOption) => void;
	/** Message shown when there are no options. */
	emptyMessage?: string;
	/** Renders a checkbox per row and keeps the list open on select. */
	multi?: boolean;
	/** DOM id for the listbox element (for aria-controls). */
	id?: string;
	/** Builds the DOM id for an option (for aria-activedescendant). */
	getOptionId?: (index: number) => string;
	classNames?: OptionListStyles;
}

const ROW_HEIGHT = {
	sm: 30,
	md: 36,
} as const;

/**
 * A virtualized listbox of options shared by `Select` and `MultiSelect`. Only
 * the visible rows are rendered, so it scales to very large option sets.
 */
export function OptionList({
	options,
	getIsSelected,
	activeIndex,
	onSelect,
	emptyMessage = "No options found",
	multi = false,
	size = "md",
	id,
	getOptionId,
	classNames,
}: OptionListProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	// eslint-disable-next-line
	const virtualizer = useVirtualizer({
		count: options.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => ROW_HEIGHT[size ?? "md"],
		overscan: 8,
	});

	// Keep the highlighted option scrolled into view.
	useEffect(() => {
		if (activeIndex >= 0 && activeIndex < options.length) {
			virtualizer.scrollToIndex(activeIndex, { align: "auto" });
		}
	}, [activeIndex, options.length, virtualizer]);

	if (options.length === 0) {
		return (
			<div
				id={id}
				role="listbox"
				aria-multiselectable={multi || undefined}
				className={empty({ className: classNames?.empty })}
			>
				{emptyMessage}
			</div>
		);
	}

	return (
		<div
			ref={scrollRef}
			id={id}
			role="listbox"
			aria-multiselectable={multi || undefined}
			className={listbox({ className: classNames?.listbox })}
		>
			<div
				style={{
					height: virtualizer.getTotalSize(),
					position: "relative",
					width: "100%",
				}}
			>
				{virtualizer.getVirtualItems().map((virtualRow) => {
					const item = options[virtualRow.index];
					if (!item) {
						return null;
					}

					const selected = getIsSelected(item);
					const isActive = virtualRow.index === activeIndex;

					return (
						<div
							key={item.value}
							id={getOptionId?.(virtualRow.index)}
							role="option"
							aria-selected={selected}
							aria-disabled={item.disabled || undefined}
							data-active={isActive}
							data-selected={selected}
							data-disabled={item.disabled}
							onClick={() => {
								if (!item.disabled) {
									onSelect(item);
								}
							}}
							className={optionSlot({ size, className: classNames?.option })}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: virtualRow.size,
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							{multi && (
								<Checkbox
									checked={selected}
									readOnly
									tabIndex={-1}
									aria-hidden="true"
									size="sm"
									classNames={{ control: "pointer-events-none" }}
								/>
							)}
							<span className="truncate">{item.label}</span>
							{!multi && selected && (
								<CheckIcon
									size={16}
									className={checkIcon({ className: classNames?.checkIcon })}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
