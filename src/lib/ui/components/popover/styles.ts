import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		content: [
			"rounded-surface border border-border bg-background-elevated p-4 shadow-overlay",
			"focus-visible:outline-none",
		],
	},
});

export { styles };
