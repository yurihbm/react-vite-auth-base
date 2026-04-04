import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const queryClient = new QueryClient();

function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
			<header className="flex h-16 items-center justify-center">
				<h1 className="text-xl font-bold">React Vite Auth Base</h1>
			</header>
			<main className="flex min-h-[calc(100vh-4rem-3rem)] flex-col gap-4 px-4 py-6">
				<Outlet />
			</main>
			<footer className="border-t-foreground flex h-12 items-center justify-center border-t text-xs">
				Made with ❤️ by Yuri Maciel
			</footer>
			<TanStackRouterDevtools />
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}

export const Route = createRootRoute({ component: RootLayout });
