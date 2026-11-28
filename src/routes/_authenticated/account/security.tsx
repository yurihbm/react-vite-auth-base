import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { useAuth } from "@modules/auth";
import {
	ChangeEmailForm,
	ChangePasswordForm,
	DeleteAccount,
	LogoutOthers,
} from "@modules/users";

export const Route = createFileRoute("/_authenticated/account/security")({
	component: SecurityComponent,
});

function SecurityComponent() {
	const { user } = useAuth<true>();
	const t = useTranslate("users");

	return (
		<div className="mx-auto flex w-full flex-col gap-6 sm:max-w-sm">
			<h2 className="text-lg font-bold">{t("securityPage.title")}</h2>
			<Link to="/account" className="text-sm underline">
				{t("securityPage.back")}
			</Link>
			<section className="flex flex-col gap-2">
				<h3 className="font-bold">{t("securityPage.sections.email")}</h3>
				<ChangeEmailForm />
			</section>
			<section className="flex flex-col gap-2">
				<h3 className="font-bold">{t("securityPage.sections.password")}</h3>
				<ChangePasswordForm />
			</section>
			<section className="flex flex-col gap-2">
				<h3 className="font-bold">{t("securityPage.sections.sessions")}</h3>
				<LogoutOthers />
			</section>
			<section className="flex flex-col gap-2">
				<h3 className="font-bold">{t("securityPage.sections.delete")}</h3>
				<DeleteAccount uuid={user.uuid} />
			</section>
		</div>
	);
}
