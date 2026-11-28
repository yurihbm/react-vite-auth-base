import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		root: ["flex items-start gap-1.5 text-sm text-danger"],
		icon: ["mt-0.5 shrink-0"],
	},
});
