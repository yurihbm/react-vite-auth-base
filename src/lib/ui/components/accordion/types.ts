import type { ReactNode } from "react";

export interface AccordionItem {
	value: string;
	title: ReactNode;
	content: ReactNode;
	disabled?: boolean;
}
