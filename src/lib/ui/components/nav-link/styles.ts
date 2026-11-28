import { tv } from "tailwind-variants";

export const styles = tv({
	base: [
		"inline-flex h-9 cursor-pointer items-center rounded-control px-3",
		"text-sm font-medium whitespace-nowrap text-foreground-muted",
		"transition-colors duration-200",
		"hover:bg-subtle-hover hover:text-foreground",
		"aria-[current=page]:bg-subtle aria-[current=page]:text-foreground",
		"disabled:cursor-not-allowed disabled:opacity-50",
	],
});
