import { tv } from "tailwind-variants";

export const styles = tv({
	base: "font-semibold tracking-tight text-balance text-foreground",
	variants: {
		size: {
			xl: "text-3xl",
			lg: "text-2xl",
			md: "text-xl",
			sm: "text-lg",
			xs: "text-base",
		},
	},
});
