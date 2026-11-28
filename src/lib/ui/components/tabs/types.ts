import type { ReactNode } from "react";

export interface TabItem {
	value: string;
	label: ReactNode;
	content: ReactNode;
	disabled?: boolean;
}
