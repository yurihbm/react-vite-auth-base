import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["border-b border-border bg-background"],
		bar: ["flex h-16 items-center gap-4 px-4 sm:px-6"],
		brand: [
			"shrink-0 text-base font-semibold whitespace-nowrap text-foreground",
		],
		nav: ["hidden flex-1 items-center gap-1 md:flex"],
		actions: ["ml-auto flex items-center gap-2"],
		toggle: [
			"inline-flex size-11 cursor-pointer items-center justify-center rounded-control",
			"text-foreground-muted transition-colors duration-200",
			"hover:bg-subtle-hover hover:text-foreground",
			"md:hidden",
		],
		panel: [
			"flex flex-col gap-1 border-t border-border px-4 py-3 sm:px-6",
			"md:hidden",
		],
	},
});
