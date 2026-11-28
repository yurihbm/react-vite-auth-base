import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Alert } from "@lib/ui";
import {
	AuthLayout,
	clearOAuthRedirect,
	getOAuthRedirect,
	oauthCallbackBeforeLoad,
	oauthErrorKey,
	VerifyCodeForm,
} from "@modules/auth";

export const Route = createFileRoute("/oauth/callback")({
	component: RouteComponent,
	validateSearch: (search): { verification?: "required"; error?: string } => ({
		verification: search.verification === "required" ? "required" : undefined,
		error: typeof search.error === "string" ? search.error : undefined,
	}),
	beforeLoad: ({ context, search }) =>
		oauthCallbackBeforeLoad({ context, search }),
});

const { useSearch } = Route;

function RouteComponent() {
	const search = useSearch();
	const t = useTranslate("auth");
	const translate = useTranslate("errors");
	const errorKey = oauthErrorKey(search.error);

	if (search.verification === "required") {
		return (
			<AuthLayout
				title={t("verifyPage.title")}
				description={t("verifyCodeForm.description")}
			>
				<VerifyCodeForm
					redirectTo={getOAuthRedirect()}
					onVerified={clearOAuthRedirect}
				/>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout
			title={t("oauthCallbackPage.errorTitle")}
			footer={
				<Link
					to="/login"
					search={{ redirect: "/" }}
					className="font-medium text-foreground underline"
				>
					{t("oauthCallbackPage.backToLogin")}
				</Link>
			}
		>
			<Alert
				color="danger"
				description={
					errorKey ? translate(errorKey) : translate("oauth.unknown")
				}
			/>
		</AuthLayout>
	);
}
