import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

export const viewportStyles = tv({
	base: [
		"pointer-events-none fixed z-50 flex w-full max-w-sm flex-col gap-2 p-4",
	],
	variants: {
		position: {
			"top-right": "top-0 right-0 items-end",
			"top-left": "top-0 left-0 items-start",
			"bottom-right": "right-0 bottom-0 items-end",
			"bottom-left": "bottom-0 left-0 items-start",
		},
	},
	defaultVariants: {
		position: "bottom-right",
	},
});

const styles = tv({
	slots: {
		root: [
			"pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg",
		],
		content: ["flex flex-1 flex-col gap-0.5"],
		title: ["text-sm font-semibold"],
		description: ["text-sm opacity-90"],
		closeButton: [
			"shrink-0 rounded p-0.5 opacity-70 transition-opacity duration-200",
			"hover:opacity-100",
			"focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
		],
	},
	variants: {
		color: {
			subtle: {
				root: "border-border bg-background-elevated text-foreground",
			},
			info: {
				root: "border-info bg-info-subtle text-info-subtle-foreground",
			},
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
		color: "subtle",
	},
});

export type ToastStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type ToastColor = NonNullable<VariantProps<typeof styles>["color"]>;

export type ToastPosition = NonNullable<
	VariantProps<typeof viewportStyles>["position"]
>;

export const { root, content, title, description, closeButton } = styles();
