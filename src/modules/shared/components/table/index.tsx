import type { ChangeEventHandler, ReactNode } from "react";
import type { TableStyles } from "./styles";
import type { ColumnDef, RowSelectionState } from "./types";

import { CheckIcon, MinusIcon } from "@phosphor-icons/react";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { styles } from "./styles";

export type { ColumnDef, RowSelectionState };

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

function createSelectionColumn<T>(
	mode: SelectionMode,
	classNames?: TableStyles,
): ColumnDef<T, unknown> {
	return {
		id: "select",
		enableSorting: false,
		enableHiding: false,
		header: ({ table }) => {
			if (mode !== "multi-select") return null;

			const isAllSelected = table.getIsAllRowsSelected();
			const isSomeSelected = table.getIsSomeRowsSelected();
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

interface TableBaseProps<T> {
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
	className?: string;
	classNames?: TableStyles;
}

export type TableProps<T> =
	| (TableBaseProps<T> & {
			selectionMode?: "none";
			getRowId?: (row: T, index: number) => string;
	  })
	| (TableBaseProps<T> & {
			selectionMode: "select" | "multi-select";
			/** Required for selectable tables so selection tracks the record, not its row index. */
			getRowId: (row: T, index: number) => string;
	  });

export function Table<T>({
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

	// TanStack Table requires a stable `columns` reference: a new array
	// identity on every render resets its internal row-selection tracking.
	const resolvedColumns = useMemo(
		() =>
			selectionMode === "none"
				? columns
				: [createSelectionColumn<T>(selectionMode, classNames), ...columns],
		[selectionMode, columns, classNames],
	);

	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data,
		columns: resolvedColumns,
		getRowId,
		getCoreRowModel: getCoreRowModel(),
		enableRowSelection: selectionMode !== "none",
		enableMultiRowSelection: selectionMode === "multi-select",
		state: { rowSelection: selectionState },
		onRowSelectionChange: (updater) => {
			const next =
				typeof updater === "function" ? updater(selectionState) : updater;

			if (!isControlled) setInternalSelection(next);
			onRowSelectionChange?.(next);
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
	} = styles();

	const rows = table.getRowModel().rows;
	const columnCount = resolvedColumns.length;

	return (
		<div className={root({ className })}>
			<div className={scrollArea({ className: classNames?.scrollArea })}>
				<table
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
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										colSpan={header.colSpan}
										className={th({
											size,
											bordered,
											className: classNames?.th,
										})}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</th>
								))}
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
							rows.map((row) => (
								<tr
									key={row.id}
									aria-selected={row.getIsSelected() ? true : undefined}
									className={tr({
										striped,
										selected: row.getIsSelected(),
										className: classNames?.tr,
									})}
								>
									{row.getVisibleCells().map((cell) => (
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
							))
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
