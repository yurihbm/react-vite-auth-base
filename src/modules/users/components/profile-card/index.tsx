import type { User } from "@modules/users/types";

import { useTranslate } from "@lib/i18n";
import { Badge, DescriptionList, Divider, Section } from "@lib/ui";
import { EditNameForm } from "@modules/users/components/edit-name-form";

export interface ProfileCardProps {
	user: User;
}

/**
 * The signed-in user's profile: email, role and member-since date, with the
 * name editable in place.
 */
export function ProfileCard({ user }: ProfileCardProps) {
	const t = useTranslate("users");

	return (
		<Section
			surface
			title={t("accountPage.profile.title")}
			description={t("accountPage.profile.description")}
		>
			<DescriptionList
				items={[
					{ label: t("accountPage.profile.email"), value: user.email },
					{
						label: t("accountPage.profile.role"),
						value: <Badge size="sm">{user.role}</Badge>,
					},
					{
						label: t("accountPage.profile.memberSince"),
						value: new Date(user.createdAt).toLocaleDateString(),
					},
				]}
			/>
			<Divider />
			<EditNameForm key={user.uuid} user={user} />
		</Section>
	);
}
