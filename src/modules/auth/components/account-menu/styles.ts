import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		trigger: [
			"inline-flex h-10 cursor-pointer items-center gap-2 rounded-control px-2",
			"text-sm font-medium text-foreground-muted transition-colors duration-200",
			"hover:bg-subtle-hover hover:text-foreground",
		],
		name: ["hidden max-w-40 truncate sm:inline"],
	},
});
