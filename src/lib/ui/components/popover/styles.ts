import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		content: [
			"rounded-lg border border-border bg-background-elevated p-4 shadow-lg",
			"focus-visible:outline-none",
		],
	},
});

export { styles };
