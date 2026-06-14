import type { SelectOption } from "../option-list/types";
import type { SelectStyles, SelectVariants } from "./styles";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useId, useMemo, useState } from "react";

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
} from "./styles";

export interface SelectProps extends SelectVariants {
	options: SelectOption[];
	/** The currently selected value, or null when nothing is selected. */
	value: string | null;
	onChange: (value: string | null) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	/** Enables async filtering: receives the query, resolves matching options. */
	onSearch?: (query: string) => Promise<SelectOption[]>;
	disabled?: boolean;
	label?: string;
	message?: string;
	classNames?: SelectStyles;
}

/**
 * A single-select dropdown with an embedded search field and a virtualized
 * option list, suitable for large datasets. Supports client-side filtering by
 * default, or async filtering via `onSearch`.
 */
export function Select({
	options = [],
	value,
	onChange,
	placeholder = "Select an option",
	searchPlaceholder = "Search…",
	emptyMessage,
	onSearch,
	disabled = false,
	label,
	message,
	size = "md",
	color = "primary",
	isError = false,
	classNames,
}: SelectProps) {
	const [query, setQuery] = useState("");
	const labelId = useId();
	const listboxId = useId();

	const { filtered } = useFilteredOptions({ options, query, onSearch });

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
		onSelect: (option) => onChange(option.value),
		closeOnSelect: true,
		disabled,
		onQueryReset: () => setQuery(""),
	});

	const selectedOption = useMemo(
		() => options.find((option) => option.value === value) ?? null,
		[options, value],
	);

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
				{selectedOption ? (
					<span className={triggerText({ className: classNames?.triggerText })}>
						{selectedOption.label}
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
						id={listboxId}
						options={filtered}
						size={size}
						activeIndex={activeIndex}
						getIsSelected={(option) => option.value === value}
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
