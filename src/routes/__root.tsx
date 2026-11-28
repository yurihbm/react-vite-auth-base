import type { QueryClient } from "@tanstack/react-query";

import {
	createLink,
	createRootRouteWithContext,
	Link,
	Outlet,
} from "@tanstack/react-router";

import { DevTools } from "@lib/dev-tools";
import { areDevToolsEnabled } from "@lib/dev-tools/utils";
import { useTranslate } from "@lib/i18n";
import { Navbar, NavLink, SkipLink } from "@lib/ui";
import { AccountMenu, StepUpProvider, useAuth } from "@modules/auth";
import { LanguageSwitcher, ThemeToggle } from "@modules/shared";

const MAIN_CONTENT_ID = "main-content";

const RouterNavLink = createLink(NavLink);

function RootLayout() {
	const t = useTranslate();
	const { isAuthenticated, user } = useAuth();

	return (
		<StepUpProvider>
			<div className="flex min-h-dvh flex-col">
				<SkipLink href={`#${MAIN_CONTENT_ID}`}>
					{t("nav.skipToContent")}
				</SkipLink>
				<Navbar
					brand={<Link to="/">React Vite Auth Base</Link>}
					navLabel={t("nav.label")}
					menuLabel={t("nav.menu")}
					actions={isAuthenticated && <AccountMenu />}
				>
					<RouterNavLink to="/" activeOptions={{ exact: true }}>
						{t("nav.link.home")}
					</RouterNavLink>
					{isAuthenticated ? (
						user?.role === "admin" && (
							<>
								<RouterNavLink
									to="/admin/users"
									search={{}}
									activeOptions={{ includeSearch: false }}
								>
									{t("nav.link.adminUsers")}
								</RouterNavLink>
								<RouterNavLink
									to="/admin/audit-logs"
									search={{}}
									activeOptions={{ includeSearch: false }}
								>
									{t("nav.link.adminAuditLogs")}
								</RouterNavLink>
							</>
						)
					) : (
						<>
							<RouterNavLink to="/login" search={{ redirect: "/" }}>
								{t("nav.link.login")}
							</RouterNavLink>
							<RouterNavLink to="/register" search={{ redirect: "/" }}>
								{t("nav.link.register")}
							</RouterNavLink>
						</>
					)}
				</Navbar>
				{/* Pages add their own horizontal padding once they use Container. */}
				<main
					id={MAIN_CONTENT_ID}
					tabIndex={-1}
					className="flex flex-1 flex-col gap-4 px-4 py-6 outline-none sm:px-6"
				>
					<Outlet />
				</main>
				<footer className="border-t border-border">
					<div
						className={[
							"flex flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between",
							"text-xs text-foreground-muted sm:px-6",
							// Keep the dev tools' floating buttons off the footer content.
							areDevToolsEnabled() ? "pb-16" : "",
						].join(" ")}
					>
						<p>{t("footer.message")}</p>
						<div className="flex items-center gap-3">
							<LanguageSwitcher />
							<ThemeToggle />
						</div>
					</div>
				</footer>
			</div>
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
