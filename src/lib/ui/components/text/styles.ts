import { tv } from "tailwind-variants";

export const styles = tv({
	variants: {
		variant: {
			body: "text-base text-foreground",
			muted: "text-sm text-foreground-muted",
			caption: "text-xs text-foreground-subtle",
			label: "text-sm font-medium text-foreground",
		},
	},
	defaultVariants: {
		variant: "body",
	},
});
