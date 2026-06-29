import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const menuStyles = tv({
	base: [
		"w-fit min-w-[10rem] rounded-lg border border-border py-1",
		"bg-background-muted shadow-xl",
		"focus:outline-none",
	],
});

const itemStyles = tv({
	base: [
		"flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm",
		"text-foreground transition-colors duration-150",
		"hover:bg-background-elevated",
		"focus:bg-background-elevated focus:outline-none",
		"aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
	],
	variants: {
		color: {
			default: "text-foreground",
			danger: "text-danger hover:bg-danger/10 focus:bg-danger/10",
		},
	},
	defaultVariants: {
		color: "default",
	},
});

const separatorStyles = tv({
	base: ["my-1 h-px bg-border"],
});

export type DropdownMenuItemVariants = VariantProps<typeof itemStyles>;

export { menuStyles, itemStyles, separatorStyles };
