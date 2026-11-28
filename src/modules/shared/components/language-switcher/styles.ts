import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		base: ["flex gap-1 text-base"],
		switchButton: [
			"inline-flex size-11 cursor-pointer items-center justify-center rounded-control",
			"opacity-60 transition-opacity duration-200",
			"hover:bg-subtle-hover hover:opacity-100",
			"aria-pressed:bg-subtle aria-pressed:opacity-100",
		],
	},
});

export const { base, switchButton } = styles();

export type LanguageSwitcherStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
