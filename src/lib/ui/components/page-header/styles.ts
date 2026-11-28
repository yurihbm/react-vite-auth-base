import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["flex flex-col gap-3"],
		backLink: ["text-sm text-foreground-muted"],
		row: ["flex flex-col gap-4", "sm:flex-row sm:items-end sm:justify-between"],
		titleGroup: ["flex min-w-0 flex-col gap-1"],
		actions: ["flex shrink-0 flex-wrap items-center gap-2"],
	},
});
