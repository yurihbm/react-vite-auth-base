import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Alert } from "@lib/ui";
import {
	LoginForm,
	OAuthButtons,
	publicOnlyRouteBeforeLoad,
	safeRedirect,
} from "@modules/auth";

const REASONS = ["expired", "passwordReset"] as const;

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

	return (
		<div className="mx-auto flex w-full flex-col gap-4 sm:max-w-sm">
			{search.reason && (
				<Alert
					type={search.reason === "expired" ? "warning" : "success"}
					description={
						search.reason === "expired"
							? t("loginPage.reason.expired")
							: t("loginPage.reason.passwordReset")
					}
				/>
			)}
			<LoginForm redirectTo={search.redirect} />
			<Link to="/password/forgot" className="text-sm underline">
				{t("loginPage.forgotPassword")}
			</Link>
			<OAuthButtons redirectTo={search.redirect} />
		</div>
	);
}
