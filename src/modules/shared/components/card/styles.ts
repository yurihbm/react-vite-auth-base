import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["rounded-lg border border-border bg-background-elevated"],
		header: ["border-b border-border font-semibold"],
		body: [""],
		footer: ["border-t border-border"],
	},
	variants: {
		padding: {
			none: { header: "", body: "", footer: "" },
			sm: { header: "p-3", body: "p-3", footer: "p-3" },
			md: { header: "p-4", body: "p-4", footer: "p-4" },
			lg: { header: "p-6", body: "p-6", footer: "p-6" },
		},
	},
	defaultVariants: {
		padding: "md",
	},
});

export type CardStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type CardVariants = VariantProps<typeof styles>;

export { styles };
