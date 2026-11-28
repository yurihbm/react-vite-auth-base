import type { ReactNode } from "react";

import { Container, Heading, Text } from "@lib/ui";

import { styles } from "./styles";

export interface AuthLayoutProps {
	/** The page's h1. */
	title: ReactNode;
	/** One line under the title. */
	description?: ReactNode;
	/** A page-level message above the content, e.g. an `Alert`. */
	alert?: ReactNode;
	/** Below the card, e.g. a link to the other flow. */
	footer?: ReactNode;
	children: ReactNode;
}

/**
 * The frame of the sign-in, sign-up and recovery pages: a narrow card centered
 * in the page with the page's h1, an optional message slot, the form and an
 * optional footer.
 */
export function AuthLayout({
	title,
	description,
	alert,
	footer,
	children,
}: AuthLayoutProps) {
	const { root, card, header, footer: footerSlot } = styles();

	return (
		<Container className={root()} size="narrow">
			<div className={card()}>
				<div className={header()}>
					<Heading level={1} size="lg">
						{title}
					</Heading>
					{description && <Text variant="muted">{description}</Text>}
				</div>
				{alert}
				{children}
			</div>
			{footer && <p className={footerSlot()}>{footer}</p>}
		</Container>
	);
}
