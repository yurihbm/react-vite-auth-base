import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		guest: [
			"flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center",
		],
		guestText: ["flex max-w-xl flex-col gap-3"],
		user: ["flex flex-col gap-8 py-6"],
		shortcut: ["group block h-full rounded-surface"],
		shortcutCard: [
			"h-full transition-colors duration-200 group-hover:border-border-control",
		],
		shortcutBody: ["flex gap-4"],
		shortcutIcon: ["mt-0.5 shrink-0 text-foreground-muted"],
		shortcutText: ["flex flex-col gap-1"],
	},
});
