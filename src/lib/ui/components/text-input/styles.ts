import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		labelContainer: ["flex flex-col gap-1"],
		labelRow: ["flex items-center justify-between gap-2"],
		labelText: ["text-sm font-medium text-foreground"],
		baseContainer: ["flex flex-col gap-1"],
		inputMessage: ["min-h-4 text-xs text-foreground-muted"],
		inputContainer: [
			"flex items-center gap-2 rounded-control border border-border-control bg-background-muted",
			"transition-colors duration-200",
			"focus-within:border-ring focus-within:focus-outline",
			"data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60",
		],
		innerInput: [
			"w-full bg-transparent text-foreground outline-none placeholder:text-foreground-subtle",
			"disabled:cursor-not-allowed",
		],
	},
	variants: {
		size: {
			sm: {
				inputContainer: ["h-8 px-3"],
				innerInput: ["text-sm"],
			},
			md: {
				inputContainer: ["h-10 px-3"],
				innerInput: ["text-base"],
			},
			lg: {
				inputContainer: ["h-12 px-4"],
				innerInput: ["text-lg"],
			},
		},
		color: {
			primary: {
				inputContainer: ["focus-within:border-primary"],
			},
			secondary: {
				inputContainer: ["focus-within:border-secondary"],
			},
			subtle: {
				inputContainer: ["focus-within:border-foreground-muted"],
			},
			info: {
				inputContainer: ["focus-within:border-info"],
			},
			success: {
				inputContainer: ["focus-within:border-success"],
			},
			warning: {
				inputContainer: ["focus-within:border-warning"],
			},
			danger: {
				inputContainer: ["focus-within:border-danger"],
			},
		},
		isError: {
			true: {
				inputContainer: [
					"border-danger bg-danger-subtle/20",
					"focus-within:border-danger",
				],
				inputMessage: ["text-danger"],
			},
		},
		isSuccess: {
			true: {
				inputContainer: [
					"border-success bg-success-subtle/20",
					"focus-within:border-success",
				],
				inputMessage: ["text-success"],
			},
		},
	},
	defaultVariants: {
		size: "md",
		color: "primary",
	},
});

export type TextInputStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type TextInputVariants = VariantProps<typeof styles>;

export const {
	labelContainer,
	labelRow,
	labelText,
	baseContainer,
	inputMessage,
	inputContainer,
	innerInput,
} = styles();
