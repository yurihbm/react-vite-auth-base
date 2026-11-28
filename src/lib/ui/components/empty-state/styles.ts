import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: [
			"flex flex-col items-center justify-center gap-2 text-center",
			"rounded-surface border border-dashed border-border px-6 py-12",
		],
		icon: [
			"mb-1 flex size-12 items-center justify-center rounded-full",
			"bg-background-muted text-foreground-subtle",
		],
		title: ["text-base font-semibold text-foreground"],
		description: ["max-w-sm text-sm text-foreground-muted"],
		action: ["mt-2"],
	},
});
