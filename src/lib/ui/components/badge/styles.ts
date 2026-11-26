import { tv } from "tailwind-variants";

export const styles = tv({
	base: [
		"inline-flex items-center justify-center gap-1 rounded-full font-medium",
		"whitespace-nowrap",
	],
	variants: {
		size: {
			sm: "px-2 py-0.5 text-xs",
			md: "px-2.5 py-0.5 text-sm",
		},
		color: {
			primary: "bg-primary-subtle text-primary-subtle-foreground",
			secondary: "bg-secondary-subtle text-secondary-subtle-foreground",
			subtle: "bg-subtle text-subtle-foreground",
			info: "bg-info-subtle text-info-subtle-foreground",
			success: "bg-success-subtle text-success-subtle-foreground",
			warning: "bg-warning-subtle text-warning-subtle-foreground",
			danger: "bg-danger-subtle text-danger-subtle-foreground",
		},
	},
	defaultVariants: {
		size: "md",
		color: "subtle",
	},
});
