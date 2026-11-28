import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import {
	AuthLayout,
	publicOnlyRouteBeforeLoad,
	ResetPasswordForm,
} from "@modules/auth";

export const Route = createFileRoute("/(auth)/password/reset")({
	component: RouteComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
});

function RouteComponent() {
	const t = useTranslate("auth");

	return (
		<AuthLayout
			title={t("resetPasswordPage.title")}
			description={t("resetPasswordForm.description")}
			footer={
				<>
					{t("resetPasswordPage.noCode")}{" "}
					<Link
						to="/password/forgot"
						className="font-medium text-foreground underline"
					>
						{t("resetPasswordPage.requestAgain")}
					</Link>
				</>
			}
		>
			<ResetPasswordForm />
		</AuthLayout>
	);
}
