import type { ButtonProps } from "@lib/ui";

import { createLink } from "@tanstack/react-router";

import { Button } from "@lib/ui";

/**
 * A router `Link` that looks like a `Button` (same `variant`, `color` and
 * `size`), with typed `to`, `params` and `search`.
 */
export const ButtonLink = createLink(function ButtonAnchor(
	props: ButtonProps<"a">,
) {
	return <Button {...props} as="a" />;
});
