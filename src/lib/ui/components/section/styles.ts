import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["flex flex-col gap-4"],
		header: ["flex flex-col gap-1"],
	},
	variants: {
		surface: {
			true: {
				root: ["rounded-surface border border-border bg-surface", "p-4 sm:p-6"],
			},
		},
	},
	defaultVariants: {
		surface: false,
	},
});
