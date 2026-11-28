import { tv } from "tailwind-variants";

export const styles = tv({
	base: [
		"sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50",
		// not-sr-only resets padding, so set it on focus.
		"rounded-control bg-background-elevated focus:px-4 focus:py-2",
		"text-sm font-medium",
		"text-foreground shadow-overlay",
		"focus:ring-2 focus:ring-ring focus:outline-none",
	],
});
