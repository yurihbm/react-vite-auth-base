import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		toggleButton: [
			"inline-flex size-11 cursor-pointer items-center justify-center rounded-control",
			"text-base hover:bg-subtle-hover active:bg-subtle-active",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"disabled:hover:bg-transparent disabled:active:bg-transparent",
		],
	},
});

export const { toggleButton } = styles();

export type ThemeToggleStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
