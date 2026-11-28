import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["flex flex-col gap-4"],
		toolbar: ["flex flex-col gap-3 sm:flex-row sm:items-start"],
		search: ["sm:flex-1"],
		role: ["sm:w-48"],
		// Filters never show validation messages; drop the reserved line.
		noMessage: ["hidden"],
		resultsBar: ["flex min-h-6 items-center gap-2"],
		results: ["transition-opacity duration-200"],
		table: ["hidden md:block"],
		cards: ["flex flex-col gap-3 md:hidden"],
		card: [
			"flex flex-col gap-1 rounded-surface border border-border bg-surface p-4",
			"transition-colors duration-200 hover:border-border-control",
		],
		cardName: ["font-medium text-foreground"],
		cardMeta: ["flex items-center justify-between gap-2"],
		skeletons: ["flex flex-col gap-2"],
		footer: ["flex flex-col items-center gap-3 sm:flex-row sm:justify-between"],
	},
	variants: {
		stale: {
			true: { results: "opacity-60" },
		},
	},
});
