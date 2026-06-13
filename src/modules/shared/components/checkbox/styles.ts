import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex flex-col gap-1"],
		control: ["inline-flex items-start gap-2"],
		inputWrapper: ["relative flex shrink-0 items-center justify-center"],
		nativeInput: [
			"peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0",
			"disabled:cursor-not-allowed",
		],
		box: [
			"flex items-center justify-center rounded border border-border-strong",
			"bg-background-muted text-transparent transition-colors duration-200",
			"peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
			"peer-indeterminate:border-primary peer-indeterminate:bg-primary peer-indeterminate:text-primary-foreground",
			"peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40",
			"peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
		],
		indicator: ["hidden peer-checked:block"],
		indeterminateIndicator: ["hidden peer-indeterminate:block"],
		labelText: ["cursor-pointer text-sm text-foreground select-none"],
		message: ["min-h-4 text-xs text-foreground-muted"],
	},
	variants: {
		size: {
			sm: {
				inputWrapper: "size-4",
				box: "size-4",
			},
			md: {
				inputWrapper: "size-5",
				box: "size-5",
			},
		},
		isError: {
			true: {
				box: [
					"border-danger",
					"peer-checked:border-danger peer-checked:bg-danger",
					"peer-indeterminate:border-danger peer-indeterminate:bg-danger",
				],
				message: "text-danger",
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type CheckboxStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type CheckboxVariants = VariantProps<typeof styles>;

export const {
	root,
	control,
	inputWrapper,
	nativeInput,
	box,
	indicator,
	indeterminateIndicator,
	labelText,
	message: messageSlot,
} = styles();
