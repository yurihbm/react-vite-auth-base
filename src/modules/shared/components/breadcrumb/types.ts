import type { ReactNode } from "react";

export interface BreadcrumbItem {
	label: ReactNode;
	href?: string;
	onClick?: () => void;
}
