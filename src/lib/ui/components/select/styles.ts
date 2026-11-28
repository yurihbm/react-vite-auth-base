import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["relative flex flex-col gap-1"],
		labelText: ["text-sm font-medium text-foreground"],
		trigger: [
			"flex w-full items-center justify-between gap-2 rounded-control border border-border-control",
			"bg-background-muted text-left text-foreground transition-colors duration-200",
			"focus-visible:border-ring",
			"disabled:cursor-not-allowed disabled:opacity-60",
		],
		triggerText: ["truncate"],
		placeholder: ["truncate text-foreground-subtle"],
		chevron: [
			"shrink-0 text-foreground-subtle transition-transform duration-200",
			"data-[open=true]:rotate-180",
		],
		panel: [
			"absolute top-full left-0 z-40 mt-1 w-full overflow-hidden rounded-surface",
			"border border-border bg-background-muted shadow-overlay",
		],
		searchWrapper: ["border-b border-border p-2"],
		searchInput: [
			"w-full rounded-control bg-background px-2 py-1 text-sm text-foreground",
			"placeholder:text-foreground-subtle",
		],
		message: ["min-h-4 text-xs text-foreground-muted"],
	},
	variants: {
		size: {
			sm: { trigger: "h-8 px-3 text-sm" },
			md: { trigger: "h-10 px-3 text-base" },
			lg: { trigger: "h-12 px-4 text-lg" },
		},
		color: {
			primary: {
				trigger: "focus-visible:border-primary",
			},
			secondary: {
				trigger: "focus-visible:border-secondary",
			},
			subtle: {
				trigger: "focus-visible:border-foreground-muted",
			},
		},
		isError: {
			true: {
				trigger: [
					"border-danger bg-danger-subtle/20",
					"focus-visible:border-danger",
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
