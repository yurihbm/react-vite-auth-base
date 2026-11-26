import type { Decorator } from "@storybook/react-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";

/**
 * Storybook decorator that provides the query client and router the auth forms
 * need, without touching the network until a form is submitted.
 */
export const withAuthProviders: Decorator = (Story) => {
	const queryClient = new QueryClient();
	const router = createRouter({
		routeTree: createRootRoute({ component: Story }),
		history: createMemoryHistory(),
	});

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	);
};
