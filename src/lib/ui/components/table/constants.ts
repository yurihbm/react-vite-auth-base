import {
	createSortedRowModel,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
} from "@tanstack/react-table";

/**
 * TanStack Table features enabled for `Table`. The sort functions are the ones
 * `sortFn: "auto"` can resolve to; anything else falls back to the basic sort.
 */
export const TABLE_FEATURES = tableFeatures({
	rowSortingFeature,
	rowSelectionFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});
