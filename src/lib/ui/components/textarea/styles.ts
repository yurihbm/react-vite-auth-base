import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex flex-col gap-1"],
		labelText: ["text-sm font-medium text-foreground"],
		baseContainer: ["flex flex-col gap-1"],
		inputContainer: [
			"w-full rounded border border-border bg-background-muted",
			"transition-colors duration-200",
			"focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
			"data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60",
		],
		textarea: [
			"w-full resize-y bg-transparent text-foreground outline-none placeholder:text-foreground-subtle",
			"disabled:cursor-not-allowed",
		],
		footer: ["flex items-center justify-between"],
		message: ["min-h-4 text-xs text-foreground-muted"],
		charCount: ["text-xs text-foreground-subtle tabular-nums"],
	},
	variants: {
		size: {
			sm: {
				inputContainer: ["px-3 py-1.5"],
				textarea: ["text-sm"],
			},
			md: {
				inputContainer: ["px-3 py-2"],
				textarea: ["text-base"],
			},
		},
		isError: {
			true: {
				inputContainer: [
					"border-danger bg-danger-subtle/20",
					"focus-within:border-danger focus-within:ring-danger/40",
				],
				message: ["text-danger"],
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type TextareaStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type TextareaVariants = VariantProps<typeof styles>;

export { styles };
