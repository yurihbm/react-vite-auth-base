import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

/**
 * DevTools component is responsible for rendering the development tools for
 * both React Query and TanStack Router.
 *
 * @returns The DevTools component, or null in production environment or when
 *   `VITE_DISABLE_DEV_TOOLS` is `"true"` (env values are strings).
 */
export function DevTools() {
	if (
		import.meta.env.PROD ||
		import.meta.env.VITE_DISABLE_DEV_TOOLS === "true"
	) {
		return null;
	}

	return (
		<>
			<TanStackRouterDevtools />
			<ReactQueryDevtools />
		</>
	);
}
