import { createFileRoute } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Alert } from "@lib/ui";
import {
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
	const translate = useTranslate("errors");
	const errorKey = oauthErrorKey(search.error);

	if (search.verification === "required") {
		return (
			<VerifyCodeForm
				redirectTo={getOAuthRedirect()}
				onVerified={clearOAuthRedirect}
			/>
		);
	}

	return (
		<Alert
			color="danger"
			description={errorKey ? translate(errorKey) : translate("oauth.unknown")}
		/>
	);
}
