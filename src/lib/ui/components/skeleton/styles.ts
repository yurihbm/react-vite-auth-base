import { tv } from "tailwind-variants";

export const styles = tv({
	base: ["block animate-pulse bg-background-elevated"],
	variants: {
		variant: {
			text: "h-4 w-full rounded",
			rect: "rounded-md",
			circle: "rounded-full",
		},
	},
	defaultVariants: {
		variant: "text",
	},
});
