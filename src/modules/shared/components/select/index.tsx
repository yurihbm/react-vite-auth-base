import type { SelectOption } from "../option-list/types";
import type { SelectStyles, SelectVariants } from "./styles";

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
} from "./styles";

interface SelectBaseProps extends SelectVariants {
	options?: SelectOption[];
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

export interface SelectSingleProps extends SelectBaseProps {
	isMulti?: false;
	value: string | null;
	onChange: (value: string | null) => void;
	countLabel?: never;
	maxSelected?: never;
}

export interface SelectMultiProps extends SelectBaseProps {
	isMulti: true;
	value: string[];
	onChange: (value: string[]) => void;
	/** Builds the trigger summary text. Defaults to `"{n} selected"`. */
	countLabel?: (count: number) => string;
	/**
	 * Maximum number of selectable options. Must be ≥ 1; pass `undefined` for
	 * no limit. Passing `0` silently blocks all selections.
	 */
	maxSelected?: number;
}

export type SelectProps = SelectSingleProps | SelectMultiProps;

/** Backward-compat alias — prefer `<Select isMulti>` for new code. */
export type MultiSelectProps = SelectMultiProps;

export function Select(props: SelectProps) {
	const {
		options = [],
		searchPlaceholder = "Search...",
		emptyMessage,
		onSearch,
		disabled = false,
		label,
		message,
		size = "md",
		color = "primary",
		isError = false,
		classNames,
	} = props;

	// props.isMulti as the ternary condition gives TypeScript full discriminant
	// narrowing at each extraction site, so no `as` casts are needed anywhere.
	// multiValue also doubles as the runtime mode flag: null = single, array = multi.
	const multiValue = props.isMulti ? (props.value ?? []) : null;
	const singleValue = props.isMulti ? null : props.value;
	const multiOnChange = props.isMulti ? props.onChange : null;
	const singleOnChange = props.isMulti ? null : props.onChange;
	const maxSelected = props.isMulti ? props.maxSelected : undefined;
	const countLabel = props.isMulti
		? (props.countLabel ?? ((n: number) => `${n} selected`))
		: null;
	const placeholder =
		props.placeholder ??
		(props.isMulti ? "Select options" : "Select an option");

	const [query, setQuery] = useState("");
	const labelId = useId();
	const listboxId = useId();

	const { filtered } = useFilteredOptions({ options, query, onSearch });

	function resetQuery() {
		setQuery("");
	}

	function handleSelect(option: SelectOption) {
		if (multiValue !== null) {
			if (multiValue.includes(option.value)) {
				multiOnChange!(multiValue.filter((v) => v !== option.value));
			} else if (maxSelected === undefined || multiValue.length < maxSelected) {
				multiOnChange!([...multiValue, option.value]);
			}
		} else {
			singleOnChange!(option.value);
		}
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
		onSelect: handleSelect,
		closeOnSelect: multiValue === null,
		disabled,
		onQueryReset: resetQuery,
	});

	const selectedOption =
		singleValue !== null
			? (options.find((o) => o.value === singleValue) ?? null)
			: null;

	function getIsSelected(option: SelectOption) {
		if (multiValue !== null) return multiValue.includes(option.value);
		return option.value === singleValue;
	}

	const getOptionId = (index: number) => `${listboxId}-opt-${index}`;
	const activeOptionId =
		open && activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

	function renderTriggerLabel() {
		if (multiValue !== null) {
			if (multiValue.length > 0) {
				return (
					<span className={triggerText({ className: classNames?.triggerText })}>
						{countLabel!(multiValue.length)}
					</span>
				);
			}
		} else if (selectedOption) {
			return (
				<span className={triggerText({ className: classNames?.triggerText })}>
					{selectedOption.label}
				</span>
			);
		}
		return (
			<span className={placeholderSlot({ className: classNames?.placeholder })}>
				{placeholder}
			</span>
		);
	}

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
				{renderTriggerLabel()}
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
						multi={multiValue !== null}
						id={listboxId}
						options={filtered}
						size={size}
						activeIndex={activeIndex}
						getIsSelected={getIsSelected}
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
