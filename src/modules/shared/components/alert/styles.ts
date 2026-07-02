import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex items-start gap-3 rounded-lg border p-4"],
		icon: ["mt-0.5 shrink-0"],
		body: ["flex flex-1 flex-col gap-1"],
		title: ["text-sm font-semibold"],
		description: ["text-sm opacity-90"],
		dismissButton: [
			"shrink-0 rounded opacity-70 transition-opacity",
			"inline-flex min-h-11 min-w-11 items-center justify-center",
			"hover:opacity-100",
			"focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
		],
	},
	variants: {
		type: {
			info: { root: "border-info bg-info-subtle text-info-subtle-foreground" },
			success: {
				root: "border-success bg-success-subtle text-success-subtle-foreground",
			},
			warning: {
				root: "border-warning bg-warning-subtle text-warning-subtle-foreground",
			},
			danger: {
				root: "border-danger bg-danger-subtle text-danger-subtle-foreground",
			},
		},
	},
	defaultVariants: {
		type: "info",
	},
});

export type AlertStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type AlertVariants = VariantProps<typeof styles>;

export { styles };
