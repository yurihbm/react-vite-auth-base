import type { QueryClient } from "@tanstack/react-query";

import {
	createRootRouteWithContext,
	Link,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";

import { DevTools } from "@lib/dev-tools";
import { useTranslate } from "@lib/i18n";
import { StepUpProvider, useAuth, useLogout } from "@modules/auth";
import { LanguageSwitcher, ThemeToggle } from "@modules/shared";

function RootLayout() {
	const t = useTranslate();
	const { isAuthenticated } = useAuth();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const navigate = useNavigate();

	function handleLogout() {
		logout(undefined, {
			onSuccess: () => {
				navigate({ to: "/" });
			},
		});
	}

	return (
		<StepUpProvider>
			<header className="flex h-16 items-center justify-between px-4">
				<h1 className="text-xl font-bold">React Vite Auth Base</h1>
				<nav>
					<ul className="flex items-center gap-4">
						<li>
							<Link
								to="/"
								className="text-sm font-medium text-foreground/80 hover:text-foreground"
							>
								{t("nav.link.home")}
							</Link>
						</li>
						{isAuthenticated ? (
							<>
								<li>
									<Link
										to="/account"
										className="text-sm font-medium text-foreground/80 hover:text-foreground"
									>
										{t("nav.link.account")}
									</Link>
								</li>
								<li>
									<button
										type="button"
										disabled={isLoggingOut}
										onClick={handleLogout}
										className="text-sm font-medium text-foreground/80 hover:text-foreground"
									>
										{t("nav.link.logout")}
									</button>
								</li>
							</>
						) : (
							<>
								<li>
									<Link
										to="/login"
										className="text-sm font-medium text-foreground/80 hover:text-foreground"
										search={{
											redirect: "/",
										}}
									>
										{t("nav.link.login")}
									</Link>
								</li>
								<li>
									<Link
										to="/register"
										search={{
											redirect: "/",
										}}
										className="text-sm font-medium text-foreground/80 hover:text-foreground"
									>
										{t("nav.link.register")}
									</Link>
								</li>
							</>
						)}
					</ul>
				</nav>
			</header>
			<main className="flex min-h-[calc(100vh-4rem-3rem)] flex-col gap-4 px-4 py-6">
				<Outlet />
			</main>
			<footer className="relative flex h-12 items-center justify-center border-t border-t-foreground text-xs">
				{t("footer.message")}
				<div className="absolute right-5 flex items-center gap-3">
					<LanguageSwitcher />
					<ThemeToggle />
				</div>
			</footer>
			<DevTools />
		</StepUpProvider>
	);
}

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});
