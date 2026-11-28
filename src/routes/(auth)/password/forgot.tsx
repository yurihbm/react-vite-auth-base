import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import {
	AuthLayout,
	ForgotPasswordForm,
	publicOnlyRouteBeforeLoad,
} from "@modules/auth";

export const Route = createFileRoute("/(auth)/password/forgot")({
	component: RouteComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
});

function RouteComponent() {
	const t = useTranslate("auth");

	return (
		<AuthLayout
			title={t("forgotPasswordPage.title")}
			description={t("forgotPasswordForm.description")}
			footer={
				<>
					{t("forgotPasswordPage.remember")}{" "}
					<Link
						to="/login"
						search={{ redirect: "/" }}
						className="font-medium text-foreground underline"
					>
						{t("forgotPasswordPage.logIn")}
					</Link>
				</>
			}
		>
			<ForgotPasswordForm />
		</AuthLayout>
	);
}
