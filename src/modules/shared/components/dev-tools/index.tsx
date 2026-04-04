import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

/**
 * DevTools component is responsible for rendering the development tools for
 * both React Query and TanStack Router.
 */
export function DevTools() {
	return (
		<>
			<TanStackRouterDevtools />
			<ReactQueryDevtools />
		</>
	);
}
