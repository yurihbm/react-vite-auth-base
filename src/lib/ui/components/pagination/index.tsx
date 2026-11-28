import type { PaginationStyles, PaginationVariants } from "./styles";

import { styles } from "./styles";

export type { PaginationStyles, PaginationVariants };

export interface PaginationProps extends PaginationVariants {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	siblingCount?: number;
	showEdgeButtons?: boolean;
	classNames?: PaginationStyles;
}

function getPageRange(
	page: number,
	totalPages: number,
	siblingCount: number,
): (number | "ellipsis")[] {
	const result: (number | "ellipsis")[] = [];

	if (totalPages <= 1) return [];

	const left = Math.max(2, page - siblingCount);
	const right = Math.min(totalPages - 1, page + siblingCount);

	result.push(1);
	if (left > 2) result.push("ellipsis");
	for (let i = left; i <= right; i++) result.push(i);
	if (right < totalPages - 1) result.push("ellipsis");
	result.push(totalPages);

	return result;
}

const activeClass = "bg-primary text-primary-foreground hover:bg-primary/90";
const inactiveClass = "text-foreground hover:bg-background-muted";

export function Pagination({
	page,
	totalPages,
	onPageChange,
	siblingCount = 1,
	showEdgeButtons = true,
	size,
	classNames,
}: PaginationProps) {
	const { root, button, ellipsis } = styles({ size });

	if (totalPages <= 1) return null;

	const currentPage = Math.min(Math.max(page, 1), totalPages);
	const range = getPageRange(currentPage, totalPages, siblingCount);
	const isFirst = currentPage === 1;
	const isLast = currentPage === totalPages;

	return (
		<nav
			aria-label="Pagination"
			className={root({ className: classNames?.root })}
		>
			{showEdgeButtons && (
				<button
					type="button"
					aria-label="First page"
					disabled={isFirst}
					onClick={() => onPageChange(1)}
					className={button({
						className: [inactiveClass, classNames?.button],
					})}
				>
					«
				</button>
			)}
			<button
				type="button"
				aria-label="Previous page"
				disabled={isFirst}
				onClick={() => onPageChange(currentPage - 1)}
				className={button({
					className: [inactiveClass, classNames?.button],
				})}
			>
				‹
			</button>
			{range.map((entry, index) =>
				entry === "ellipsis" ? (
					<span
						key={`ellipsis-${index}`}
						className={ellipsis({ className: classNames?.ellipsis })}
					>
						<span aria-hidden="true">…</span>
					</span>
				) : (
					<button
						key={entry}
						type="button"
						aria-label={`Page ${entry}`}
						aria-current={currentPage === entry ? "page" : undefined}
						onClick={() => onPageChange(entry)}
						className={button({
							className: [
								currentPage === entry ? activeClass : inactiveClass,
								classNames?.button,
							],
						})}
					>
						{entry}
					</button>
				),
			)}
			<button
				type="button"
				aria-label="Next page"
				disabled={isLast}
				onClick={() => onPageChange(currentPage + 1)}
				className={button({
					className: [inactiveClass, classNames?.button],
				})}
			>
				›
			</button>
			{showEdgeButtons && (
				<button
					type="button"
					aria-label="Last page"
					disabled={isLast}
					onClick={() => onPageChange(totalPages)}
					className={button({
						className: [inactiveClass, classNames?.button],
					})}
				>
					»
				</button>
			)}
		</nav>
	);
}
