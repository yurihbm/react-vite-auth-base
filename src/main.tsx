import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { shouldRetryQuery } from "@lib/api";
import { initI18n } from "@lib/i18n";
import { ToastProvider } from "@lib/ui";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import "./main.css";

const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: shouldRetryQuery } },
});

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

await initI18n();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ToastProvider>
				<RouterProvider router={router} />
			</ToastProvider>
		</QueryClientProvider>
	</StrictMode>,
);
