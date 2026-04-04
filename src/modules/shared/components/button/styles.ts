import { tv } from "tailwind-variants";

export const styles = tv({
	base: [
		"flex items-center justify-center gap-2 rounded px-4 py-2",
		"transition-colors duration-200",
		"cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
	],
	variants: {
		size: {
			sm: "text-sm",
			md: "text-base",
			lg: "text-lg",
		},
		color: {
			primary: [
				"bg-primary text-primary-foreground",
				"hover:bg-primary-hover active:bg-primary-active",
				"disabled:hover:bg-primary disabled:active:bg-primary",
			],
			secondary: [
				"bg-secondary text-secondary-foreground",
				"hover:bg-secondary-hover active:bg-secondary-active",
				"disabled:hover:bg-secondary disabled:active:bg-secondary",
			],
			subtle: [
				"bg-subtle text-subtle-foreground",
				"hover:bg-subtle-hover active:bg-subtle-active",
				"disabled:hover:bg-subtle disabled:active:bg-subtle",
			],
			info: [
				"bg-info text-info-foreground",
				"hover:bg-info-hover active:bg-info-active",
				"disabled:hover:bg-info disabled:active:bg-info",
			],
			success: [
				"bg-success text-success-foreground",
				"hover:bg-success-hover active:bg-success-active",
				"disabled:hover:bg-success disabled:active:bg-success",
			],
			warning: [
				"bg-warning text-warning-foreground",
				"hover:bg-warning-hover active:bg-warning-active",
				"disabled:hover:bg-warning disabled:active:bg-warning",
			],
			danger: [
				"bg-danger text-danger-foreground",
				"hover:bg-danger-hover active:bg-danger-active",
				"disabled:hover:bg-danger disabled:active:bg-danger",
			],
		},
	},
	defaultVariants: {
		size: "md",
		color: "primary",
	},
});
