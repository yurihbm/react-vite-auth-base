import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["flex flex-col gap-4"],
		toolbarHeader: ["flex items-center justify-between gap-3"],
		filters: ["grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3"],
		// Filters never show validation messages; drop the reserved line.
		noMessage: ["hidden"],
		resultsBar: [
			"flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
		],
		totalGroup: ["flex min-h-6 items-center gap-2"],
		summary: ["flex flex-wrap items-center gap-2"],
		results: ["transition-opacity duration-200"],
		table: ["hidden md:block"],
		cards: ["flex flex-col gap-3 md:hidden"],
		card: [
			"flex flex-col gap-2 rounded-surface border border-border bg-surface p-4",
		],
		cardHeader: ["flex items-start justify-between gap-2"],
		skeletons: ["flex flex-col gap-2"],
		footer: ["flex flex-col items-center gap-3 sm:flex-row sm:justify-between"],
	},
	variants: {
		open: {
			true: { filters: "grid" },
			false: { filters: "hidden md:grid" },
		},
		stale: {
			true: { results: "opacity-60" },
		},
	},
});
