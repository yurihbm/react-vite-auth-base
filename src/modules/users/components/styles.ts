import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		base: "flex w-full flex-col gap-2",
		errorMessage: "text-danger",
	},
});

export const { base, errorMessage } = styles();
