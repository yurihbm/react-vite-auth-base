import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Alert, Divider } from "@lib/ui";
import {
	AuthLayout,
	LoginForm,
	OAuthButtons,
	publicOnlyRouteBeforeLoad,
	safeRedirect,
} from "@modules/auth";

const REASONS = ["expired", "passwordReset", "emailChanged"] as const;

type LoginReason = (typeof REASONS)[number];

export const Route = createFileRoute("/(auth)/login")({
	component: LoginComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
	validateSearch: (search): { redirect: string; reason?: LoginReason } => {
		const reason = REASONS.find((value) => value === search.reason);
		return { redirect: safeRedirect(search.redirect), reason };
	},
});

const { useSearch } = Route;

function LoginComponent() {
	const search = useSearch();
	const t = useTranslate("auth");
	const reasonMessages = {
		expired: t("loginPage.reason.expired"),
		passwordReset: t("loginPage.reason.passwordReset"),
		emailChanged: t("loginPage.reason.emailChanged"),
	};

	return (
		<AuthLayout
			title={t("loginPage.title")}
			description={t("loginPage.description")}
			alert={
				search.reason && (
					<Alert
						color={search.reason === "expired" ? "warning" : "success"}
						description={reasonMessages[search.reason]}
					/>
				)
			}
			footer={
				<>
					{t("loginPage.noAccount")}{" "}
					<Link
						to="/register"
						search={{ redirect: search.redirect }}
						className="font-medium text-foreground underline"
					>
						{t("loginPage.createAccount")}
					</Link>
				</>
			}
		>
			<LoginForm redirectTo={search.redirect} />
			<Divider label={t("oauthButtons.divider")} />
			<OAuthButtons redirectTo={search.redirect} />
		</AuthLayout>
	);
}
