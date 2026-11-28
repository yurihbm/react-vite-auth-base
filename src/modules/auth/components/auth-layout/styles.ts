import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["flex flex-1 flex-col justify-center gap-6 py-6"],
		card: [
			"flex flex-col gap-6",
			"sm:rounded-surface sm:border sm:border-border sm:bg-background sm:p-8",
			"sm:shadow-raised",
		],
		header: ["flex flex-col gap-1"],
		footer: ["text-center text-sm text-foreground-muted"],
	},
});
