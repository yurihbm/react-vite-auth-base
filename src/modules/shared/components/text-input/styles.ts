import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		labelContainer: ["flex flex-col gap-1"],
		labelText: ["text-sm font-medium text-foreground"],
		baseContainer: ["flex flex-col gap-1"],
		inputMessage: ["text-xs text-foreground-muted"],
		inputContainer: [
			"flex items-center gap-2 rounded border border-border bg-background-muted",
			"transition-colors duration-200",
			"focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
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
				inputContainer: ["px-3 py-1.5"],
				innerInput: ["text-sm"],
			},
			md: {
				inputContainer: ["px-3 py-2"],
				innerInput: ["text-base"],
			},
			lg: {
				inputContainer: ["px-4 py-2.5"],
				innerInput: ["text-lg"],
			},
		},
		color: {
			primary: {
				inputContainer: [
					"focus-within:border-primary focus-within:ring-primary/40",
				],
			},
			secondary: {
				inputContainer: [
					"focus-within:border-secondary focus-within:ring-secondary/40",
				],
			},
			subtle: {
				inputContainer: [
					"focus-within:border-border-strong focus-within:ring-ring/40",
				],
			},
			info: {
				inputContainer: ["focus-within:border-info focus-within:ring-info/40"],
			},
			success: {
				inputContainer: [
					"focus-within:border-success focus-within:ring-success/40",
				],
			},
			warning: {
				inputContainer: [
					"focus-within:border-warning focus-within:ring-warning/40",
				],
			},
			danger: {
				inputContainer: [
					"focus-within:border-danger focus-within:ring-danger/40",
				],
			},
		},
		isError: {
			true: {
				inputContainer: [
					"border-danger bg-danger-subtle/20",
					"focus-within:border-danger focus-within:ring-danger/40",
				],
				inputMessage: ["text-danger"],
			},
		},
		isSuccess: {
			true: {
				inputContainer: [
					"border-success bg-success-subtle/20",
					"focus-within:border-success focus-within:ring-success/40",
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
	labelText,
	baseContainer,
	inputMessage,
	inputContainer,
	innerInput,
} = styles();
