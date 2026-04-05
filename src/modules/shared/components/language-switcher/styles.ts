import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		base: ["flex gap-2 text-base"],
		switchButton: [
			"cursor-pointer rounded p-1",
			"hover:bg-background-elevated active:bg-background-muted",
			"disabled:cursor-not-allowed disabled:opacity-50",
			"disabled:hover:bg-transparent disabled:active:bg-transparent",
		],
	},
});

export const { base, switchButton } = styles();

export type LanguageSwitcherStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
