/**
 * A single selectable option shared by `OptionList`, `Select`, and
 * `MultiSelect`. `value` must be unique within a given list.
 */
export interface SelectOption {
	label: string;
	value: string;
	disabled?: boolean;
}
