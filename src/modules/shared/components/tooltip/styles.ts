import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		wrapper: ["relative inline-flex"],
		content: [
			"absolute z-50 w-max max-w-xs",
			"rounded px-2 py-1 text-xs font-medium shadow",
			"border border-border bg-background-elevated text-foreground",
			"pointer-events-none",
		],
	},
	variants: {
		side: {
			top: {
				content: "bottom-full left-1/2 mb-2 -translate-x-1/2",
			},
			bottom: {
				content: "top-full left-1/2 mt-2 -translate-x-1/2",
			},
			left: {
				content: "top-1/2 right-full mr-2 -translate-y-1/2",
			},
			right: {
				content: "top-1/2 left-full ml-2 -translate-y-1/2",
			},
		},
	},
	defaultVariants: {
		side: "top",
	},
});

export const { wrapper, content } = styles();
export { styles };
