import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		overlay: [
			"fixed inset-0 z-50 flex items-center justify-center p-4",
			"bg-scrim backdrop-blur-sm",
		],
		panel: [
			"relative flex max-h-full w-full flex-col overflow-hidden rounded-surface",
			"border border-border bg-background-muted shadow-overlay",
			"focus:outline-none",
			"motion-reduce:animate-none",
		],
		header: ["flex flex-col gap-1 border-b border-border px-6 py-4"],
		title: ["text-lg font-semibold text-foreground"],
		description: ["text-sm text-foreground-muted"],
		body: ["flex-1 overflow-y-auto px-6 py-4 text-foreground"],
		footer: [
			"flex items-center justify-end gap-2 border-t border-border px-6 py-4",
		],
		closeButton: [
			"absolute top-2 right-2 inline-flex size-11 items-center justify-center",
			"rounded-control text-foreground-subtle",
			"transition-colors duration-200",
			"hover:bg-background-elevated hover:text-foreground",
			"cursor-pointer",
		],
	},
	variants: {
		size: {
			sm: { panel: "max-w-sm" },
			md: { panel: "max-w-lg" },
			lg: { panel: "max-w-2xl" },
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type DialogStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type DialogVariants = VariantProps<typeof styles>;

export const {
	overlay,
	panel,
	header,
	title: titleSlot,
	description: descriptionSlot,
	body,
	footer: footerSlot,
	closeButton,
} = styles();
