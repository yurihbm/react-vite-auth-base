import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["divide-y divide-border"],
		item: ["grid gap-1 py-3 sm:grid-cols-3 sm:gap-4"],
		label: ["text-sm font-medium text-foreground-muted"],
		value: ["text-sm break-words text-foreground sm:col-span-2"],
	},
});
