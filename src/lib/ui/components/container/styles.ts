import { tv } from "tailwind-variants";

export const styles = tv({
	base: "mx-auto w-full px-4 sm:px-6",
	variants: {
		size: {
			narrow: "max-w-md",
			default: "max-w-3xl",
			wide: "max-w-7xl",
		},
	},
	defaultVariants: {
		size: "default",
	},
});
