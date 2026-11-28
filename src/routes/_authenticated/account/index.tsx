import { createFileRoute } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Container, PageHeader, Section, Stack } from "@lib/ui";
import { useAuth } from "@modules/auth";
import { ButtonLink } from "@modules/shared";
import { ProfileCard } from "@modules/users";

export const Route = createFileRoute("/_authenticated/account/")({
	component: AccountComponent,
});

function AccountComponent() {
	const { user } = useAuth<true>();
	const t = useTranslate("users");

	return (
		<Container>
			<Stack gap="lg" className="py-6">
				<PageHeader
					title={t("accountPage.title")}
					description={t("accountPage.description")}
				/>
				<ProfileCard user={user} />
				<Section
					surface
					title={t("accountPage.security.title")}
					description={t("accountPage.security.description")}
				>
					<ButtonLink
						to="/account/security"
						variant="outline"
						className="self-start"
					>
						{t("accountPage.securityLink")}
					</ButtonLink>
				</Section>
			</Stack>
		</Container>
	);
}
