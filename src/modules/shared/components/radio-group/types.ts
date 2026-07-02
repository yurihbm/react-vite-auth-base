import type { ReactNode } from "react";

export interface RadioOption {
	value: string;
	label: ReactNode;
	disabled?: boolean;
}
