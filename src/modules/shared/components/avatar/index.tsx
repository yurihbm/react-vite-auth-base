import type { AvatarStyles, AvatarVariants } from "./styles";

import { styles } from "./styles";

const COLORS = [
	"primary",
	"secondary",
	"info",
	"success",
	"warning",
	"danger",
] as const;

type AvatarColor = (typeof COLORS)[number];

function getColorFromName(name: string): AvatarColor {
	let hash = 0;

	for (let i = 0; i < name.length; i++) {
		hash = (hash * 31 + name.charCodeAt(i)) | 0;
	}

	return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0] ?? "")
		.join("")
		.toUpperCase();
}

export interface AvatarProps extends Omit<AvatarVariants, "color"> {
	src?: string;
	name?: string;
	alt?: string;
	color?: AvatarColor;
	className?: string;
	classNames?: AvatarStyles;
}

export function Avatar({
	src,
	name,
	alt,
	size,
	color,
	className,
	classNames,
}: AvatarProps) {
	const resolvedColor = color ?? (name ? getColorFromName(name) : "primary");
	const { root, image, initials } = styles({ size, color: resolvedColor });

	return (
		<span className={root({ className: classNames?.root ?? className })}>
			{src ? (
				<img
					src={src}
					alt={alt ?? name}
					className={image({ className: classNames?.image })}
				/>
			) : (
				<span
					role="img"
					aria-label={name}
					className={initials({ className: classNames?.initials })}
				>
					{name ? getInitials(name) : null}
				</span>
			)}
		</span>
	);
}
