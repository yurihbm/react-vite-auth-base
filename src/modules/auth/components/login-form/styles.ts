import { tv } from "tailwind-variants";

export const styles = tv({
	slots: {
		base: "mx-auto flex w-full flex-col justify-center gap-5 sm:max-w-sm",
		forgotPasswordLink:
			"text-sm text-foreground-muted underline hover:text-foreground",
	},
});

export const { base, forgotPasswordLink } = styles();
