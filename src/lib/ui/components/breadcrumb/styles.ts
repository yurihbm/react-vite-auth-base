import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: [],
		list: ["flex flex-wrap items-center"],
		item: ["flex items-center"],
		link: [
			"inline-flex min-h-11 items-center px-1 py-1.5",
			"text-sm text-foreground-muted transition-colors duration-150 hover:text-foreground",
			"rounded-control",
		],
		currentPage: ["text-sm font-medium text-foreground"],
		separator: ["px-1.5 text-sm text-foreground-muted"],
	},
});

export type BreadcrumbStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export { styles };
