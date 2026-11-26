import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex flex-col"],
		tablist: ["flex border-b border-border"],
		tab: [
			"relative px-4 py-2.5 text-sm font-medium",
			"text-foreground-muted transition-colors duration-150",
			"cursor-pointer select-none",
			"hover:text-foreground",
			"focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none focus-visible:ring-inset",
			"aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:text-foreground-muted",
			"aria-selected:text-foreground",
			"aria-selected:after:absolute aria-selected:after:inset-x-0 aria-selected:after:bottom-0 aria-selected:after:h-0.5 aria-selected:after:bg-primary aria-selected:after:content-['']",
		],
		panel: ["pt-4 focus-visible:outline-none"],
	},
	variants: {
		size: {
			sm: {
				tab: "px-3 py-2 text-xs",
			},
			md: {
				tab: "px-4 py-2.5 text-sm",
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type TabsVariants = VariantProps<typeof styles>;

export const { root, tablist, tab, panel } = styles();
export { styles };
