import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["inline-flex items-center gap-1 font-mono text-xs"],
		link: ["underline"],
		copy: [
			"inline-flex size-6 cursor-pointer items-center justify-center rounded-control",
			"text-foreground-muted transition-colors duration-200",
			"hover:bg-subtle-hover hover:text-foreground",
		],
	},
});
