import { createFileRoute } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import {
	AuthLayout,
	publicOnlyRouteBeforeLoad,
	safeRedirect,
	VerifyCodeForm,
} from "@modules/auth";

export const Route = createFileRoute("/(auth)/register_/verify")({
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
			title={t("verifyPage.title")}
			description={t("verifyCodeForm.description")}
		>
			<VerifyCodeForm redirectTo={search.redirect} />
		</AuthLayout>
	);
}
