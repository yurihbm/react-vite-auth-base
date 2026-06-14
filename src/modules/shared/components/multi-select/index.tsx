import type { SelectOption } from "../option-list/types";
import type { SelectStyles, SelectVariants } from "../select/styles";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";

import { useCombobox } from "@src/modules/shared/hooks/use-combobox";
import { useFilteredOptions } from "@src/modules/shared/hooks/use-filtered-options";

import { OptionList } from "../option-list";
import {
	chevron,
	labelText,
	messageSlot,
	panel,
	placeholderSlot,
	root,
	searchInput,
	searchWrapper,
	trigger,
	triggerText,
} from "../select/styles";

export interface MultiSelectProps extends SelectVariants {
	options: SelectOption[];
	/** The currently selected values. */
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	/** Enables async filtering: receives the query, resolves matching options. */
	onSearch?: (query: string) => Promise<SelectOption[]>;
	/** Builds the trigger summary text. Defaults to `"{n} selected"`. */
	countLabel?: (count: number) => string;
	/** Maximum number of selectable options. */
	maxSelected?: number;
	disabled?: boolean;
	label?: string;
	message?: string;
	classNames?: SelectStyles;
}

/**
 * A multi-select dropdown with an embedded search field and a virtualized,
 * checkbox-based option list. The trigger summarizes the selection as a count.
 */
export function MultiSelect({
	options = [],
	value = [],
	onChange,
	placeholder = "Select options",
	searchPlaceholder = "Search…",
	emptyMessage,
	onSearch,
	countLabel = (count) => `${count} selected`,
	maxSelected,
	disabled = false,
	label,
	message,
	size = "md",
	color = "primary",
	isError = false,
	classNames,
}: MultiSelectProps) {
	const [query, setQuery] = useState("");
	const labelId = useId();
	const listboxId = useId();

	const { filtered } = useFilteredOptions({ options, query, onSearch });

	function toggleValue(option: SelectOption) {
		if (value.includes(option.value)) {
			onChange(value.filter((v) => v !== option.value));
			return;
		}

		if (maxSelected !== undefined && value.length >= maxSelected) {
			return;
		}

		onChange([...value, option.value]);
	}

	const {
		open,
		activeIndex,
		rootRef,
		searchRef,
		toggle,
		selectOption,
		handleTriggerKeyDown,
		handleSearchKeyDown,
	} = useCombobox({
		options: filtered,
		onSelect: toggleValue,
		closeOnSelect: false,
		disabled,
		onQueryReset: () => setQuery(""),
	});

	const getOptionId = (index: number) => `${listboxId}-opt-${index}`;
	const activeOptionId =
		open && activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

	return (
		<div ref={rootRef} className={root({ className: classNames?.root })}>
			{label && (
				<span
					id={labelId}
					className={labelText({ className: classNames?.labelText })}
				>
					{label}
				</span>
			)}
			<button
				type="button"
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listboxId}
				aria-labelledby={label ? labelId : undefined}
				aria-invalid={isError || undefined}
				disabled={disabled}
				onClick={toggle}
				onKeyDown={handleTriggerKeyDown}
				className={trigger({
					size,
					color,
					isError,
					className: classNames?.trigger,
				})}
			>
				{value.length > 0 ? (
					<span className={triggerText({ className: classNames?.triggerText })}>
						{countLabel(value.length)}
					</span>
				) : (
					<span
						className={placeholderSlot({ className: classNames?.placeholder })}
					>
						{placeholder}
					</span>
				)}
				<CaretDownIcon
					size={16}
					data-open={open}
					className={chevron({ className: classNames?.chevron })}
				/>
			</button>

			{open && (
				<div className={panel({ className: classNames?.panel })}>
					<div
						className={searchWrapper({ className: classNames?.searchWrapper })}
					>
						<input
							ref={searchRef}
							type="text"
							value={query}
							placeholder={searchPlaceholder}
							aria-controls={listboxId}
							aria-activedescendant={activeOptionId}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={handleSearchKeyDown}
							className={searchInput({ className: classNames?.searchInput })}
						/>
					</div>
					<OptionList
						multi
						id={listboxId}
						options={filtered}
						size={size}
						activeIndex={activeIndex}
						getIsSelected={(option) => value.includes(option.value)}
						onSelect={selectOption}
						getOptionId={getOptionId}
						emptyMessage={emptyMessage}
					/>
				</div>
			)}

			{message && (
				<p className={messageSlot({ isError, className: classNames?.message })}>
					{message}
				</p>
			)}
		</div>
	);
}
