import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: [
			"flex flex-col gap-4 py-5 first:pt-0 last:pb-0",
			"md:flex-row md:items-start md:justify-between md:gap-8",
		],
		text: ["flex flex-col gap-1 md:max-w-xs"],
		action: ["flex flex-col md:w-80 md:shrink-0"],
	},
});
