import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["flex flex-col gap-4"],
		header: ["flex flex-col gap-1"],
	},
	variants: {
		surface: {
			true: {
				root: ["rounded-surface border bg-surface", "p-4 sm:p-6"],
			},
		},
		tone: {
			default: {},
			danger: {},
		},
	},
	compoundVariants: [
		{ surface: true, tone: "default", class: { root: "border-border" } },
		{ surface: true, tone: "danger", class: { root: "border-danger" } },
	],
	defaultVariants: {
		surface: false,
		tone: "default",
	},
});
