import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex flex-wrap items-center gap-1"],
		button: [
			"inline-flex items-center justify-center rounded font-medium",
			"transition-colors duration-150",
			"focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
			"disabled:cursor-not-allowed disabled:opacity-50",
		],
		ellipsis: [
			"inline-flex items-center justify-center text-foreground-muted select-none",
		],
	},
	variants: {
		size: {
			sm: {
				button: "h-11 min-w-8 px-1.5 text-xs",
				ellipsis: "h-11 min-w-8 text-xs",
			},
			md: {
				button: "h-11 min-w-11 px-2 text-sm",
				ellipsis: "h-11 min-w-11 text-sm",
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type PaginationStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type PaginationVariants = VariantProps<typeof styles>;
export { styles };
