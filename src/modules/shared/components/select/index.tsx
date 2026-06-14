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
	/** Maximum number of selectable options. */
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

	const isMulti = props.isMulti === true;
	const placeholder =
		props.placeholder ?? (isMulti ? "Select options" : "Select an option");

	const multiValue = isMulti ? (props as SelectMultiProps).value : null;
	const singleValue = !isMulti ? (props as SelectSingleProps).value : null;

	const [query, setQuery] = useState("");
	const labelId = useId();
	const listboxId = useId();

	const { filtered } = useFilteredOptions({ options, query, onSearch });

	function handleSelect(option: SelectOption) {
		if (isMulti && multiValue !== null) {
			const { onChange, maxSelected } = props as SelectMultiProps;
			if (multiValue.includes(option.value)) {
				onChange(multiValue.filter((v) => v !== option.value));
			} else if (maxSelected === undefined || multiValue.length < maxSelected) {
				onChange([...multiValue, option.value]);
			}
		} else {
			(props as SelectSingleProps).onChange(option.value);
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
		closeOnSelect: !isMulti,
		disabled,
		onQueryReset: () => setQuery(""),
	});

	const selectedOption = useMemo(
		() =>
			singleValue !== null
				? (options.find((o) => o.value === singleValue) ?? null)
				: null,
		[options, singleValue],
	);

	const getIsSelected = (option: SelectOption) => {
		if (multiValue !== null) return multiValue.includes(option.value);
		return option.value === singleValue;
	};

	const getOptionId = (index: number) => `${listboxId}-opt-${index}`;
	const activeOptionId =
		open && activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

	function renderTriggerLabel() {
		if (multiValue !== null) {
			const { countLabel = (n: number) => `${n} selected` } =
				props as SelectMultiProps;
			if (multiValue.length > 0) {
				return (
					<span className={triggerText({ className: classNames?.triggerText })}>
						{countLabel(multiValue.length)}
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
						multi={isMulti}
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
