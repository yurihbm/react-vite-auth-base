import { tv } from "tailwind-variants";

export const styles = tv({
	base: "flex flex-row flex-wrap items-center",
	variants: {
		gap: {
			none: "gap-0",
			xs: "gap-1",
			sm: "gap-2",
			md: "gap-4",
			lg: "gap-6",
			xl: "gap-8",
		},
	},
	defaultVariants: {
		gap: "sm",
	},
});
