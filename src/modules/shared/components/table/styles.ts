import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: [
			"h-full min-h-0 w-full overflow-hidden rounded-lg border border-border",
		],
		scrollArea: ["h-full min-h-0 w-full overflow-auto"],
		table: ["w-full caption-bottom border-collapse text-sm"],
		caption: ["mt-4 text-sm text-foreground-muted"],
		thead: ["bg-background-muted"],
		theadRow: ["border-b-2 border-border"],
		tbody: ["[&_tr:last-child]:border-0"],
		tfoot: ["border-t border-border font-medium"],
		tr: [
			"border-b border-border transition-colors",
			"hover:bg-background-muted/50",
		],
		th: [
			"text-left align-middle font-semibold whitespace-nowrap text-foreground",
		],
		td: ["align-middle"],
		emptyCell: ["px-4 py-8 text-center text-sm text-foreground-muted"],
		checkboxWrapper: [
			"relative flex size-4 shrink-0 items-center justify-center",
		],
		checkboxNativeInput: [
			"peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0",
			"disabled:cursor-not-allowed",
		],
		checkboxBox: [
			"flex size-4 items-center justify-center rounded border border-border-strong",
			"bg-background-muted text-transparent transition-colors duration-200",
			"peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
			"peer-indeterminate:border-primary peer-indeterminate:bg-primary peer-indeterminate:text-primary-foreground",
			"peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40",
			"peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
		],
	},
	variants: {
		size: {
			sm: { th: "px-3 py-2 text-xs", td: "px-3 py-2 text-xs" },
			md: { th: "px-4 py-3 text-sm", td: "px-4 py-3 text-sm" },
			lg: { th: "px-6 py-4 text-base", td: "px-6 py-4 text-base" },
		},
		bordered: {
			true: {
				table: "[&_tr>*:last-child]:border-r-0",
				th: "border-r border-border",
				td: "border-r border-border",
			},
		},
		sticky: {
			true: { thead: "sticky top-0 z-10" },
		},
		striped: {
			true: { tr: "[&:nth-child(even)]:bg-background-muted/30" },
		},
		selected: {
			true: { tr: "bg-primary/10" },
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type TableStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type TableVariants = VariantProps<typeof styles>;

export { styles };
