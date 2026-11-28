import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		base: "flex flex-col gap-2",
	},
});

export const { base } = styles();
