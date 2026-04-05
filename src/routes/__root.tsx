import type { QueryClient } from "@tanstack/react-query";

import {
	createRootRouteWithContext,
	Link,
	Outlet,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { DevTools, LanguageSwitcher } from "@src/modules/shared";

function RootLayout() {
	const { t } = useTranslation();

	return (
		<>
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
								className="text-sm font-medium text-foreground/80 hover:text-foreground"
							>
								{t("nav.link.register")}
							</Link>
						</li>
					</ul>
				</nav>
			</header>
			<main className="flex min-h-[calc(100vh-4rem-3rem)] flex-col gap-4 px-4 py-6">
				<Outlet />
			</main>
			<footer className="relative flex h-12 items-center justify-center border-t border-t-foreground text-xs">
				{t("footer.message")}
				<LanguageSwitcher
					classNames={{
						base: "absolute right-5",
					}}
				/>
			</footer>
			<DevTools />
		</>
	);
}

interface RouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});
