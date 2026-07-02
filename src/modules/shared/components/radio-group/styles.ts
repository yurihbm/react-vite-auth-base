import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["m-0 border-0 p-0"],
		legend: ["mb-1 text-sm font-medium text-foreground"],
		item: ["group flex items-center gap-2"],
		inputWrapper: [
			"relative flex min-h-11 min-w-11 shrink-0 items-center justify-center",
		],
		nativeInput: [
			"peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0",
			"disabled:cursor-not-allowed",
		],
		indicator: [
			"flex items-center justify-center rounded-full border border-border-strong",
			"bg-background-muted transition-colors duration-200",
			"peer-checked:border-primary peer-checked:bg-primary/10",
		],
		dot: [
			"rounded-full bg-primary opacity-0 transition-opacity",
			"peer-checked:opacity-100",
		],
		labelText: [
			"cursor-pointer text-sm text-foreground select-none",
			"group-has-[:disabled]:cursor-not-allowed group-has-[:disabled]:opacity-60",
		],
		message: ["min-h-4 text-xs text-foreground-muted"],
	},
	variants: {
		size: {
			sm: {
				inputWrapper: "size-4",
				indicator: "size-4",
				dot: "size-2",
			},
			md: {
				inputWrapper: "size-5",
				indicator: "size-5",
				dot: "size-2.5",
			},
		},
		isError: {
			true: {
				indicator: [
					"border-danger",
					"peer-checked:border-danger peer-checked:bg-danger/10",
				],
				dot: "bg-danger",
				message: "text-danger",
			},
		},
		orientation: {
			vertical: {
				root: "flex flex-col gap-2",
			},
			horizontal: {
				root: "flex flex-row flex-wrap gap-4",
			},
		},
	},
	defaultVariants: {
		size: "md",
		orientation: "vertical",
	},
});

export type RadioGroupStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type RadioGroupVariants = VariantProps<typeof styles>;

export { styles };
