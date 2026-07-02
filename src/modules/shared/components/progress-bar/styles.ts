import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex flex-col gap-1.5"],
		label: ["flex justify-between text-sm text-foreground-muted"],
		track: ["w-full overflow-hidden rounded-full bg-background-muted"],
		indicator: ["h-full rounded-full transition-[width] duration-300"],
	},
	variants: {
		size: {
			sm: { track: "h-1.5" },
			md: { track: "h-2.5" },
		},
		color: {
			primary: { indicator: "bg-primary" },
			success: { indicator: "bg-success" },
			warning: { indicator: "bg-warning" },
			danger: { indicator: "bg-danger" },
		},
		indeterminate: {
			true: { indicator: "w-1/3 animate-pulse" },
		},
	},
	defaultVariants: {
		size: "md",
		color: "primary",
	},
});

export type ProgressBarStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type ProgressBarVariants = VariantProps<typeof styles>;

export { styles };
