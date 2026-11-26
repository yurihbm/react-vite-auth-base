import type {
	RowData,
	ColumnDef as TanStackColumnDef,
} from "@tanstack/react-table";
import type { TABLE_FEATURES } from "./constants";

export type { RowSelectionState } from "@tanstack/react-table";

export type TableFeatures = typeof TABLE_FEATURES;

export type ColumnDef<
	TData extends RowData,
	TValue = unknown,
> = TanStackColumnDef<TableFeatures, TData, TValue>;
