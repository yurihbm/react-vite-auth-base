import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex flex-col divide-y divide-border border-y border-border"],
		item: [""],
		header: ["flex"],
		trigger: [
			"flex flex-1 items-center justify-between gap-2 py-3 text-left text-sm font-medium",
			"text-foreground transition-colors duration-150",
			"cursor-pointer select-none",
			"focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
			"aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
		],
		icon: ["shrink-0 transition-transform duration-150"],
		panel: ["overflow-hidden"],
		panelInner: ["pb-3 text-sm text-foreground-muted"],
	},
	variants: {
		size: {
			sm: { trigger: "py-2 text-xs" },
			md: { trigger: "py-3 text-sm" },
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type AccordionStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type AccordionVariants = VariantProps<typeof styles>;

export { styles };
