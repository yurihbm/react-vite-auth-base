import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: ["flex flex-col gap-1"],
		control: ["inline-flex items-center gap-3"],
		inputWrapper: ["relative shrink-0"],
		nativeInput: [
			"peer absolute inset-0 z-10 m-0 cursor-pointer opacity-0",
			"disabled:cursor-not-allowed",
		],
		// Absolutely-positioned background pill — sibling of nativeInput.
		track: [
			"absolute inset-0 rounded-full transition-colors duration-200",
			"bg-border",
			"peer-checked:bg-primary",
			"peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40",
			"peer-disabled:opacity-60",
		],
		// Absolutely-positioned circle — sibling of nativeInput, so
		// peer-checked:translate-x-* works correctly.
		thumb: [
			"absolute top-0.5 left-0.5 rounded-full bg-white shadow",
			"pointer-events-none transition-transform duration-200",
		],
		labelText: ["cursor-pointer text-sm text-foreground select-none"],
		switchMessage: ["min-h-4 text-xs text-foreground-muted"],
	},
	variants: {
		size: {
			sm: {
				inputWrapper: "h-4 w-7",
				thumb: "size-3 peer-checked:translate-x-3",
			},
			md: {
				inputWrapper: "h-5 w-9",
				thumb: "size-4 peer-checked:translate-x-4",
			},
		},
		isError: {
			true: {
				track: "peer-checked:bg-danger",
				switchMessage: "text-danger",
			},
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type SwitchStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type SwitchVariants = VariantProps<typeof styles>;

export const {
	root,
	control,
	inputWrapper,
	nativeInput,
	track,
	thumb,
	labelText,
	switchMessage,
} = styles();
