import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { useAuth } from "@modules/auth";
import { EditNameForm } from "@modules/users";

export const Route = createFileRoute("/_authenticated/account/")({
	component: AccountComponent,
});

function AccountComponent() {
	const { user } = useAuth<true>();
	const t = useTranslate("users");

	return (
		<section className="mx-auto flex w-full flex-col gap-4 sm:max-w-sm">
			<h2 className="text-lg font-bold">{t("accountPage.title")}</h2>
			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
				<dt className="font-medium">{t("accountPage.profile.email")}</dt>
				<dd>{user.email}</dd>
				<dt className="font-medium">{t("accountPage.profile.role")}</dt>
				<dd>{user.role}</dd>
				<dt className="font-medium">{t("accountPage.profile.memberSince")}</dt>
				<dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
			</dl>
			<EditNameForm key={user.uuid} user={user} />
			<Link to="/account/security" className="text-sm underline">
				{t("accountPage.securityLink")}
			</Link>
		</section>
	);
}
