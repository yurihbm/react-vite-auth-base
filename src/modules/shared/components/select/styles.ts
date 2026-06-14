import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["relative flex flex-col gap-1"],
		labelText: ["text-sm font-medium text-foreground"],
		trigger: [
			"flex w-full items-center justify-between gap-2 rounded border border-border",
			"bg-background-muted text-left text-foreground transition-colors duration-200",
			"focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
			"disabled:cursor-not-allowed disabled:opacity-60",
		],
		triggerText: ["truncate"],
		placeholder: ["truncate text-foreground-subtle"],
		chevron: [
			"shrink-0 text-foreground-subtle transition-transform duration-200",
			"data-[open=true]:rotate-180",
		],
		panel: [
			"absolute top-full left-0 z-40 mt-1 w-full overflow-hidden rounded",
			"border border-border bg-background-muted shadow-lg",
		],
		searchWrapper: ["border-b border-border p-2"],
		searchInput: [
			"w-full rounded bg-background px-2 py-1 text-sm text-foreground outline-none",
			"placeholder:text-foreground-subtle",
			"focus-visible:ring-2 focus-visible:ring-ring/40",
		],
		message: ["min-h-4 text-xs text-foreground-muted"],
	},
	variants: {
		size: {
			sm: { trigger: "px-3 py-1.5 text-sm" },
			md: { trigger: "px-3 py-2 text-base" },
		},
		color: {
			primary: {
				trigger: "focus-visible:border-primary focus-visible:ring-primary/40",
			},
			secondary: {
				trigger:
					"focus-visible:border-secondary focus-visible:ring-secondary/40",
			},
			subtle: {
				trigger:
					"focus-visible:border-border-strong focus-visible:ring-ring/40",
			},
		},
		isError: {
			true: {
				trigger: [
					"border-danger bg-danger-subtle/20",
					"focus-visible:border-danger focus-visible:ring-danger/40",
				],
				message: "text-danger",
			},
		},
	},
	defaultVariants: {
		size: "md",
		color: "primary",
	},
});

export type SelectStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type SelectVariants = VariantProps<typeof styles>;

export const {
	root,
	labelText,
	trigger,
	triggerText,
	placeholder: placeholderSlot,
	chevron,
	panel,
	searchWrapper,
	searchInput,
	message: messageSlot,
} = styles();
