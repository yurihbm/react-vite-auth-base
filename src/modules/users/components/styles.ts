import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		base: "flex w-full flex-col gap-5",
	},
});

export const { base } = styles();
