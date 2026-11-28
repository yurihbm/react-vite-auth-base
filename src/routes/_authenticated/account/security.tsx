import { ArrowLeftIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Container, PageHeader, Section, SettingRow, Stack } from "@lib/ui";
import { useAuth } from "@modules/auth";
import { usePageTitle } from "@modules/shared";
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

	usePageTitle(t("securityPage.title"));

	return (
		<Container>
			<Stack gap="lg" className="py-6">
				<PageHeader
					backLink={
						<Link
							to="/account"
							className="inline-flex items-center gap-1 hover:text-foreground"
						>
							<ArrowLeftIcon aria-hidden="true" size={14} />
							{t("securityPage.back")}
						</Link>
					}
					title={t("securityPage.title")}
					description={t("securityPage.description")}
				/>
				<Section
					surface
					title={t("securityPage.signIn.title")}
					description={t("securityPage.signIn.description")}
				>
					<div className="flex flex-col divide-y divide-border">
						<SettingRow
							title={t("securityPage.sections.email")}
							description={t("changeEmailForm.description")}
						>
							<ChangeEmailForm />
						</SettingRow>
						<SettingRow
							title={t("securityPage.sections.password")}
							description={t("changePasswordForm.description")}
						>
							<ChangePasswordForm />
						</SettingRow>
						<SettingRow
							title={t("securityPage.sections.sessions")}
							description={t("logoutOthers.description")}
						>
							<LogoutOthers />
						</SettingRow>
					</div>
				</Section>
				<Section
					surface
					tone="danger"
					title={t("securityPage.dangerZone.title")}
					description={t("securityPage.dangerZone.description")}
				>
					<SettingRow
						title={t("securityPage.sections.delete")}
						description={t("deleteAccount.description")}
					>
						<DeleteAccount uuid={user.uuid} />
					</SettingRow>
				</Section>
			</Stack>
		</Container>
	);
}
