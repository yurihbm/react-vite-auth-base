import type { VariantProps } from "tailwind-variants";

import { tv } from "tailwind-variants";

const styles = tv({
	slots: {
		root: [
			"relative inline-flex shrink-0 items-center justify-center",
			"overflow-hidden rounded-full select-none",
		],
		image: ["size-full object-cover"],
		initials: ["leading-none font-medium"],
	},
	variants: {
		size: {
			xs: { root: "size-6", initials: "text-[10px]" },
			sm: { root: "size-8", initials: "text-xs" },
			md: { root: "size-10", initials: "text-sm" },
			lg: { root: "size-12", initials: "text-base" },
			xl: { root: "size-16", initials: "text-xl" },
		},
		color: {
			primary: { root: "bg-primary text-primary-foreground" },
			secondary: { root: "bg-secondary text-secondary-foreground" },
			info: { root: "bg-info text-info-foreground" },
			success: { root: "bg-success text-success-foreground" },
			warning: { root: "bg-warning text-warning-foreground" },
			danger: { root: "bg-danger text-danger-foreground" },
		},
	},
	defaultVariants: {
		size: "md",
		color: "primary",
	},
});

export type AvatarStyles = Partial<
	Record<keyof ReturnType<typeof styles>, string>
>;
export type AvatarVariants = VariantProps<typeof styles>;

export const { root, image, initials } = styles();
export { styles };
