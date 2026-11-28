import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["w-full border-border"],
		labelled: ["flex w-full items-center gap-3"],
		line: ["h-px flex-1 bg-border"],
		label: ["text-xs text-foreground-subtle"],
	},
});
