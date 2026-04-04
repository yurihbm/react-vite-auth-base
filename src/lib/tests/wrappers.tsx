import type { PropsWithChildren } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates a React Query provider wrapper for hook tests.
 */
export function createQueryClientWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			mutations: {
				retry: false,
			},
			queries: {
				retry: false,
			},
		},
	});

	return function QueryClientTestWrapper({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};
}
