import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		base: "mx-auto flex w-full flex-col justify-center gap-2 sm:max-w-sm",
		errorMessage: "min-h-12 text-danger",
	},
});

export const { base, errorMessage } = styles();
