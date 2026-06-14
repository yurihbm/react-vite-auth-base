import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		listbox: ["max-h-60 overflow-y-auto outline-none"],
		option: [
			"flex w-full items-center gap-2 px-3 text-left text-sm text-foreground",
			"cursor-pointer select-none",
			"data-[active=true]:bg-background-elevated",
			"data-[selected=true]:font-medium data-[selected=true]:text-primary",
			"data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
		],
		checkIcon: ["ml-auto text-primary"],
		empty: ["px-3 py-6 text-center text-sm text-foreground-subtle"],
	},
	variants: {
		size: {
			sm: { option: "py-1.5" },
			md: { option: "py-2" },
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export type OptionListStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;

export type OptionListVariants = VariantProps<typeof styles>;

export const { listbox, option: optionSlot, checkIcon, empty } = styles();
