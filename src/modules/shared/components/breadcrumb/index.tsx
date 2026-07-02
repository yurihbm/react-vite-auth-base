import type { ReactNode } from "react";
import type { BreadcrumbStyles } from "./styles";
import type { BreadcrumbItem } from "./types";

import { Fragment } from "react";

import { styles } from "./styles";

export type { BreadcrumbItem };

export interface BreadcrumbProps {
	items: BreadcrumbItem[];
	separator?: ReactNode;
	classNames?: BreadcrumbStyles;
}

export function Breadcrumb({
	items,
	separator = "/",
	classNames,
}: BreadcrumbProps) {
	const { root, list, item, link, currentPage, separator: sep } = styles();

	return (
		<nav
			aria-label="Breadcrumb"
			className={root({ className: classNames?.root })}
		>
			<ol className={list({ className: classNames?.list })}>
				{items.map((entry, index) => {
					const isLast = index === items.length - 1;

					return (
						<Fragment key={index}>
							<li className={item({ className: classNames?.item })}>
								{isLast ? (
									<span
										aria-current="page"
										className={currentPage({
											className: classNames?.currentPage,
										})}
									>
										{entry.label}
									</span>
								) : entry.href ? (
									<a
										href={entry.href}
										onClick={entry.onClick}
										className={link({ className: classNames?.link })}
									>
										{entry.label}
									</a>
								) : entry.onClick ? (
									<button
										type="button"
										onClick={entry.onClick}
										className={link({ className: classNames?.link })}
									>
										{entry.label}
									</button>
								) : (
									<span className={link({ className: classNames?.link })}>
										{entry.label}
									</span>
								)}
							</li>
							{!isLast && (
								<li
									aria-hidden="true"
									className={sep({ className: classNames?.separator })}
								>
									{separator}
								</li>
							)}
						</Fragment>
					);
				})}
			</ol>
		</nav>
	);
}
