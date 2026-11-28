import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Divider } from "@lib/ui";
import {
	AuthLayout,
	OAuthButtons,
	publicOnlyRouteBeforeLoad,
	RegisterForm,
	safeRedirect,
} from "@modules/auth";

export const Route = createFileRoute("/(auth)/register")({
	component: RouteComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
	validateSearch: (search) => {
		return { redirect: safeRedirect(search.redirect) };
	},
});

const { useSearch } = Route;

function RouteComponent() {
	const search = useSearch();
	const t = useTranslate("auth");

	return (
		<AuthLayout
			title={t("registerPage.title")}
			description={t("registerPage.description")}
			footer={
				<>
					{t("registerPage.haveAccount")}{" "}
					<Link
						to="/login"
						search={{ redirect: search.redirect }}
						className="font-medium text-foreground underline"
					>
						{t("registerPage.logIn")}
					</Link>
				</>
			}
		>
			<RegisterForm redirectTo={search.redirect} />
			<Divider label={t("oauthButtons.divider")} />
			<OAuthButtons redirectTo={search.redirect} />
		</AuthLayout>
	);
}
