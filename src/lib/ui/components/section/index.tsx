import type { ComponentPropsWithRef, JSX, ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import { useId } from "react";

import { Heading } from "@lib/ui/components/heading";
import { Text } from "@lib/ui/components/text";

import { styles } from "./styles";

export type SectionProps = Omit<ComponentPropsWithRef<"section">, "title"> &
	VariantProps<typeof styles> & {
		title: ReactNode;
		description?: ReactNode;
	};

/**
 * A titled region of a page. The title is an `h2` that labels the region; set
 * `surface` to place it on a card-style surface.
 */
export function Section({
	title,
	description,
	surface,
	className,
	children,
	...rest
}: SectionProps): JSX.Element {
	const titleId = useId();
	const { root, header } = styles({ surface });

	return (
		<section
			aria-labelledby={titleId}
			{...rest}
			className={root({ className })}
		>
			<div className={header()}>
				<Heading id={titleId} level={2} size="md">
					{title}
				</Heading>
				{description && <Text variant="muted">{description}</Text>}
			</div>
			{children}
		</section>
	);
}
