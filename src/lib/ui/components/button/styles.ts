import { tv } from "tailwind-variants";

export const styles = tv({
	base: [
		"flex items-center justify-center gap-2 rounded-control",
		"whitespace-nowrap transition-colors duration-200",
		"cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
	],
	variants: {
		size: {
			sm: "h-8 px-3 text-sm",
			md: "h-10 px-4 text-base",
			lg: "h-12 px-5 text-lg",
		},
		// Outline and ghost are neutral; colors apply to solid buttons only.
		variant: {
			solid: "",
			outline: [
				"border border-border-control bg-transparent text-foreground",
				"hover:bg-subtle-hover active:bg-subtle-active",
				"disabled:hover:bg-transparent disabled:active:bg-transparent",
			],
			ghost: [
				"bg-transparent text-foreground-muted",
				"hover:bg-subtle-hover hover:text-foreground active:bg-subtle-active",
				"disabled:hover:bg-transparent disabled:active:bg-transparent",
			],
		},
		color: {
			primary: "",
			secondary: "",
			subtle: "",
			info: "",
			success: "",
			warning: "",
			danger: "",
		},
	},
	compoundVariants: [
		{
			variant: "solid",
			color: "primary",
			class: [
				"bg-primary text-primary-foreground",
				"hover:bg-primary-hover active:bg-primary-active",
				"disabled:hover:bg-primary disabled:active:bg-primary",
			],
		},
		{
			variant: "solid",
			color: "secondary",
			class: [
				"bg-secondary text-secondary-foreground",
				"hover:bg-secondary-hover active:bg-secondary-active",
				"disabled:hover:bg-secondary disabled:active:bg-secondary",
			],
		},
		{
			variant: "solid",
			color: "subtle",
			class: [
				"bg-subtle text-subtle-foreground",
				"hover:bg-subtle-hover active:bg-subtle-active",
				"disabled:hover:bg-subtle disabled:active:bg-subtle",
			],
		},
		{
			variant: "solid",
			color: "info",
			class: [
				"bg-info text-info-foreground",
				"hover:bg-info-hover active:bg-info-active",
				"disabled:hover:bg-info disabled:active:bg-info",
			],
		},
		{
			variant: "solid",
			color: "success",
			class: [
				"bg-success text-success-foreground",
				"hover:bg-success-hover active:bg-success-active",
				"disabled:hover:bg-success disabled:active:bg-success",
			],
		},
		{
			variant: "solid",
			color: "warning",
			class: [
				"bg-warning text-warning-foreground",
				"hover:bg-warning-hover active:bg-warning-active",
				"disabled:hover:bg-warning disabled:active:bg-warning",
			],
		},
		{
			variant: "solid",
			color: "danger",
			class: [
				"bg-danger text-danger-foreground",
				"hover:bg-danger-hover active:bg-danger-active",
				"disabled:hover:bg-danger disabled:active:bg-danger",
			],
		},
	],
	defaultVariants: {
		size: "md",
		variant: "solid",
		color: "primary",
	},
});
