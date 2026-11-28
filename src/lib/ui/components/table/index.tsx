import type { RowData } from "@tanstack/react-table";
import type { ChangeEventHandler, ReactNode } from "react";
import type { TableStyles } from "./styles";
import type { ColumnDef, RowSelectionState, SortingState } from "./types";

import {
	CaretDownIcon,
	CaretUpIcon,
	CheckIcon,
	MinusIcon,
} from "@phosphor-icons/react";
import { flexRender, useTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { TABLE_FEATURES } from "./constants";
import { styles } from "./styles";

export type { ColumnDef, RowSelectionState, SortingState };

type SelectionMode = "none" | "select" | "multi-select";

const DEFAULT_EMPTY_STATE = "No data available.";

interface SelectionCheckboxProps {
	checked: boolean;
	indeterminate?: boolean;
	onChange?: ChangeEventHandler<HTMLInputElement>;
	"aria-label"?: string;
	classNames?: TableStyles;
}

function SelectionCheckbox({
	checked,
	indeterminate = false,
	onChange,
	"aria-label": ariaLabel,
	classNames,
}: SelectionCheckboxProps) {
	const ref = useRef<HTMLInputElement>(null);
	const { checkboxWrapper, checkboxNativeInput, checkboxBox } = styles();

	useLayoutEffect(() => {
		if (ref.current) {
			ref.current.indeterminate = indeterminate;
		}
	}, [indeterminate]);

	return (
		<span
			className={checkboxWrapper({ className: classNames?.checkboxWrapper })}
		>
			<input
				ref={ref}
				type="checkbox"
				checked={checked}
				onChange={onChange}
				aria-label={ariaLabel}
				aria-checked={indeterminate ? "mixed" : undefined}
				className={checkboxNativeInput({
					className: classNames?.checkboxNativeInput,
				})}
			/>
			<span
				aria-hidden="true"
				className={checkboxBox({ className: classNames?.checkboxBox })}
			>
				{indeterminate ? (
					<MinusIcon size={10} weight="bold" />
				) : (
					<CheckIcon size={10} weight="bold" />
				)}
			</span>
		</span>
	);
}

function createSelectionColumn<T extends RowData>(
	mode: SelectionMode,
	classNames?: TableStyles,
): ColumnDef<T, unknown> {
	return {
		id: "select",
		enableSorting: false,
		header: ({ table }) => {
			if (mode !== "multi-select") return null;

			const isAllSelected = table.getIsAllRowsSelected();
			// v9's `getIsSomeRowsSelected` also covers the all-selected case.
			const isSomeSelected = table.getIsSomeRowsSelected() && !isAllSelected;
			const hasSelection = isAllSelected || isSomeSelected;

			return (
				<SelectionCheckbox
					checked={isAllSelected}
					indeterminate={isSomeSelected}
					onChange={() => table.toggleAllRowsSelected(!hasSelection)}
					aria-label="Select all rows"
					classNames={classNames}
				/>
			);
		},
		cell: ({ row }) => (
			<SelectionCheckbox
				checked={row.getIsSelected()}
				onChange={row.getToggleSelectedHandler()}
				aria-label={`Select row ${row.index + 1}`}
				classNames={classNames}
			/>
		),
	};
}

interface TableVirtualizeOptions {
	/** Fixed height of every body row, in pixels. */
	rowHeight: number;
	/**
	 * Called while the last row is within the rendered window, so callers can
	 * load more data. It may fire repeatedly; guard it against in-flight loads.
	 */
	onEndReached?: () => void;
}

interface TableBaseProps<T extends RowData> {
	data: T[];
	columns: ColumnDef<T, unknown>[];
	size?: "sm" | "md" | "lg";
	striped?: boolean;
	bordered?: boolean;
	sticky?: boolean;
	caption?: ReactNode;
	footer?: ReactNode;
	emptyState?: ReactNode;
	rowSelection?: RowSelectionState;
	onRowSelectionChange?: (selection: RowSelectionState) => void;
	sorting?: SortingState;
	onSortingChange?: (sorting: SortingState) => void;
	/**
	 * Renders only the rows near the viewport. The table must have a bounded
	 * height (e.g. through `className`) so the scroll area can scroll.
	 */
	virtualize?: TableVirtualizeOptions;
	/**
	 * `container` (default) scrolls inside the table; `page` lets the window
	 * scroll it so a `sticky` header follows the page. Wide content is clipped in
	 * `page` mode, so pair it with a narrow-screen alternative.
	 */
	scroll?: "container" | "page";
	/**
	 * Accessible name of the table. In `container` mode it also names the scroll
	 * area, which becomes a focusable region so keyboard users can scroll it.
	 */
	label?: string;
	className?: string;
	classNames?: TableStyles;
}

export type TableProps<T extends RowData> =
	| (TableBaseProps<T> & {
			selectionMode?: "none";
			getRowId?: (row: T, index: number) => string;
	  })
	| (TableBaseProps<T> & {
			selectionMode: "select" | "multi-select";
			/**
			 * Required for selectable tables so selection tracks the record, not its
			 * row index.
			 */
			getRowId: (row: T, index: number) => string;
	  });

export function Table<T extends RowData>({
	data,
	columns,
	getRowId,
	size = "md",
	striped = false,
	bordered = false,
	sticky = false,
	caption,
	footer,
	emptyState,
	selectionMode = "none",
	rowSelection,
	onRowSelectionChange,
	sorting,
	onSortingChange,
	virtualize,
	scroll = "container",
	label,
	className,
	classNames,
}: TableProps<T>) {
	const isControlled = rowSelection !== undefined;
	const [internalSelection, setInternalSelection] = useState<RowSelectionState>(
		{},
	);
	const selectionState = isControlled
		? (rowSelection as RowSelectionState)
		: internalSelection;

	const isSortingControlled = sorting !== undefined;
	const [internalSorting, setInternalSorting] = useState<SortingState>([]);
	const sortingState = isSortingControlled
		? (sorting as SortingState)
		: internalSorting;

	// TanStack Table requires a stable `columns` reference: a new array
	// identity on every render resets its internal row-selection tracking.
	const resolvedColumns = useMemo(
		() =>
			selectionMode === "none"
				? columns
				: [createSelectionColumn<T>(selectionMode, classNames), ...columns],
		[selectionMode, columns, classNames],
	);

	const table = useTable({
		features: TABLE_FEATURES,
		data,
		columns: resolvedColumns,
		getRowId,
		enableRowSelection: selectionMode !== "none",
		enableMultiRowSelection: selectionMode === "multi-select",
		state: { rowSelection: selectionState, sorting: sortingState },
		onRowSelectionChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(selectionState) : updater;

			if (!isControlled) setInternalSelection(next);
			onRowSelectionChange?.(next);
		},
		onSortingChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(sortingState) : updater;

			if (!isSortingControlled) setInternalSorting(next);
			onSortingChange?.(next);
		},
	});

	const {
		root,
		scrollArea,
		table: tableSlot,
		caption: captionSlot,
		thead,
		theadRow,
		tbody,
		tfoot,
		tr,
		th,
		td,
		emptyCell,
		thSortButton,
		sortIconGroup,
		sortIcon,
	} = styles();

	const rows = table.getRowModel().rows;
	const columnCount = resolvedColumns.length;

	const scrollRef = useRef<HTMLDivElement>(null);
	// oxlint-disable-next-line react/incompatible-library
	const virtualizer = useVirtualizer({
		count: virtualize ? rows.length : 0,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => virtualize?.rowHeight ?? 0,
		overscan: 8,
	});
	const virtualRows = virtualize ? virtualizer.getVirtualItems() : [];
	const lastVirtualIndex = virtualRows.at(-1)?.index ?? -1;
	const onEndReached = virtualize?.onEndReached;

	useEffect(() => {
		if (rows.length > 0 && lastVirtualIndex >= rows.length - 1) {
			onEndReached?.();
		}
	}, [lastVirtualIndex, rows.length, onEndReached]);

	const visibleRows = virtualize
		? virtualRows.flatMap((virtualRow) => rows[virtualRow.index] ?? [])
		: rows;
	const paddingTop = virtualRows[0]?.start ?? 0;
	const paddingBottom = virtualRows.length
		? virtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0)
		: 0;

	return (
		<div className={root({ scroll, className })}>
			<div
				ref={scrollRef}
				{...(scroll === "container" && label
					? { role: "region", "aria-label": label, tabIndex: 0 }
					: {})}
				className={scrollArea({ scroll, className: classNames?.scrollArea })}
			>
				<table
					aria-label={label}
					className={tableSlot({ bordered, className: classNames?.table })}
				>
					{caption && (
						<caption
							className={captionSlot({ className: classNames?.caption })}
						>
							{caption}
						</caption>
					)}
					<thead className={thead({ sticky, className: classNames?.thead })}>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr
								key={headerGroup.id}
								className={theadRow({ className: classNames?.theadRow })}
							>
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const sortDirection = header.column.getIsSorted();
									const headerContent = header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											);

									return (
										<th
											key={header.id}
											colSpan={header.colSpan}
											aria-sort={
												sortDirection === "asc"
													? "ascending"
													: sortDirection === "desc"
														? "descending"
														: canSort
															? "none"
															: undefined
											}
											className={th({
												size,
												bordered,
												className: classNames?.th,
											})}
										>
											{canSort ? (
												<button
													type="button"
													data-testid="table-sort-button"
													className={thSortButton({
														className: classNames?.thSortButton,
													})}
													onClick={header.column.getToggleSortingHandler()}
												>
													{headerContent}
													<span
														data-testid="table-sort-icon"
														aria-hidden="true"
														className={sortIconGroup({
															className: classNames?.sortIconGroup,
														})}
													>
														<CaretUpIcon
															data-testid="table-sort-icon-asc"
															size={10}
															weight="bold"
															className={sortIcon({
																sorted: sortDirection === "asc",
																className: classNames?.sortIcon,
															})}
														/>
														<CaretDownIcon
															data-testid="table-sort-icon-desc"
															size={10}
															weight="bold"
															className={sortIcon({
																sorted: sortDirection === "desc",
																className: classNames?.sortIcon,
															})}
														/>
													</span>
												</button>
											) : (
												headerContent
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody className={tbody({ className: classNames?.tbody })}>
						{rows.length === 0 ? (
							<tr>
								<td
									colSpan={columnCount}
									className={emptyCell({ className: classNames?.emptyCell })}
								>
									{emptyState ?? DEFAULT_EMPTY_STATE}
								</td>
							</tr>
						) : (
							<>
								{paddingTop > 0 && (
									<tr aria-hidden="true" style={{ height: paddingTop }} />
								)}
								{visibleRows.map((row) => (
									<tr
										key={row.id}
										style={virtualize && { height: virtualize.rowHeight }}
										aria-selected={row.getIsSelected() ? true : undefined}
										className={tr({
											striped,
											selected: row.getIsSelected(),
											className: classNames?.tr,
										})}
									>
										{row.getAllCells().map((cell) => (
											<td
												key={cell.id}
												className={td({
													size,
													bordered,
													className: classNames?.td,
												})}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</td>
										))}
									</tr>
								))}
								{paddingBottom > 0 && (
									<tr aria-hidden="true" style={{ height: paddingBottom }} />
								)}
							</>
						)}
					</tbody>
					{footer && (
						<tfoot className={tfoot({ className: classNames?.tfoot })}>
							<tr>
								<td colSpan={columnCount}>{footer}</td>
							</tr>
						</tfoot>
					)}
				</table>
			</div>
		</div>
	);
}
