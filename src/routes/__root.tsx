import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const queryClient = new QueryClient();

function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
			<header className="flex h-16 items-center justify-between px-4">
				<h1 className="text-xl font-bold">React Vite Auth Base</h1>
				<nav>
					<ul className="flex items-center gap-4">
						<li>
							<Link
								to="/"
								className="text-sm font-medium text-foreground/80 hover:text-foreground"
							>
								Home
							</Link>
						</li>
						<li>
							<Link
								to="/login"
								className="text-sm font-medium text-foreground/80 hover:text-foreground"
							>
								Login
							</Link>
						</li>
						<li>
							<Link
								to="/register"
								className="text-sm font-medium text-foreground/80 hover:text-foreground"
							>
								Register
							</Link>
						</li>
					</ul>
				</nav>
			</header>
			<main className="flex min-h-[calc(100vh-4rem-3rem)] flex-col gap-4 px-4 py-6">
				<Outlet />
			</main>
			<footer className="flex h-12 items-center justify-center border-t border-t-foreground text-xs">
				Made with ❤️ by Yuri Maciel
			</footer>
			<TanStackRouterDevtools />
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}

export const Route = createRootRoute({ component: RootLayout });
