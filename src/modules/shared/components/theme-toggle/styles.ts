import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		toggleButton: [
			"cursor-pointer rounded p-2 text-base",
			"hover:bg-background-elevated active:bg-background-muted",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"disabled:hover:bg-transparent disabled:active:bg-transparent",
		],
	},
});

export const { toggleButton } = styles();

export type ThemeToggleStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
