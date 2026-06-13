import { tv } from "tailwind-variants";

export const styles = tv({
	base: [
		"inline-block animate-spin rounded-full border-solid",
		"border-current border-t-transparent",
	],
	variants: {
		size: {
			sm: "size-4 border-2",
			md: "size-6 border-2",
			lg: "size-9 border-[3px]",
		},
		color: {
			primary: "text-primary",
			secondary: "text-secondary",
			subtle: "text-foreground-subtle",
			info: "text-info",
			success: "text-success",
			warning: "text-warning",
			danger: "text-danger",
		},
	},
	defaultVariants: {
		size: "md",
		color: "primary",
	},
});
