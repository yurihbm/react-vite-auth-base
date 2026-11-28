import { ArrowLeftIcon, UserCircleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import {
	Badge,
	DescriptionList,
	EmptyState,
	InlineError,
	PageHeader,
	Section,
	SettingRow,
	Skeleton,
	Stack,
} from "@lib/ui";
import { useAuth } from "@modules/auth";
import { DeleteAccount } from "@modules/users/components/delete-account";
import { DeleteUser } from "@modules/users/components/delete-user";
import { EditNameForm } from "@modules/users/components/edit-name-form";
import { useGetUser } from "@modules/users/services";

export interface UserDetailProps {
	uuid: string;
	/** Called after another user was deleted, e.g. to go back to the list. */
	onDeleted: () => void;
}

const BACK_LINK_CLASS = "inline-flex items-center gap-1 hover:text-foreground";

/**
 * The admin page of one user: their name and role, details, name edit and a
 * danger zone to delete them (or, on the admin's own page, their account). A
 * missing user shows an empty state that leads back to the list.
 */
export function UserDetail({ uuid, onDeleted }: UserDetailProps) {
	const t = useTranslate("users");
	const { user: me } = useAuth<true>();
	const { data: user, error, isPending } = useGetUser(uuid);
	const apiErrorMessage = useApiErrorMessage(error);

	const backLink = (
		<Link to="/admin/users" search={{}} className={BACK_LINK_CLASS}>
			<ArrowLeftIcon aria-hidden="true" size={14} />
			{t("userPage.back")}
		</Link>
	);

	if (isPending) {
		return (
			<Stack aria-busy="true" gap="lg">
				<Skeleton variant="rect" className="h-16" />
				<Skeleton variant="rect" className="h-48" />
			</Stack>
		);
	}

	if (error instanceof APIError && error.status === 404) {
		return (
			<EmptyState
				icon={<UserCircleIcon size={24} />}
				title={t("userPage.notFound.title")}
				description={t("userPage.notFound.description")}
				action={
					<Link to="/admin/users" search={{}} className="underline">
						{t("userPage.notFound.back")}
					</Link>
				}
			/>
		);
	}

	if (!user) {
		return (
			<Stack gap="lg">
				<PageHeader backLink={backLink} title={t("userPage.title")} />
				{!!error && <InlineError>{apiErrorMessage}</InlineError>}
			</Stack>
		);
	}

	return (
		<Stack gap="lg">
			<PageHeader
				backLink={backLink}
				title={
					<span className="inline-flex flex-wrap items-center gap-3">
						{user.name}
						<Badge color={user.role === "admin" ? "primary" : "subtle"}>
							{user.role}
						</Badge>
					</span>
				}
			/>
			<Section surface title={t("userPage.details.title")}>
				<DescriptionList
					items={[
						{ label: t("accountPage.profile.email"), value: user.email },
						{ label: t("accountPage.profile.role"), value: user.role },
						{
							label: t("accountPage.profile.memberSince"),
							value: new Date(user.createdAt).toLocaleDateString(),
						},
					]}
				/>
			</Section>
			<Section surface title={t("userPage.name.title")}>
				<EditNameForm key={user.uuid} user={user} />
			</Section>
			<Section
				surface
				tone="danger"
				title={t("userPage.dangerZone.title")}
				description={t("securityPage.dangerZone.description")}
			>
				{user.uuid === me.uuid ? (
					<SettingRow
						title={t("securityPage.sections.delete")}
						description={t("deleteAccount.description")}
					>
						<DeleteAccount uuid={user.uuid} />
					</SettingRow>
				) : (
					<SettingRow
						title={t("deleteUser.button")}
						description={t("deleteUser.description")}
					>
						<DeleteUser uuid={user.uuid} onDeleted={onDeleted} />
					</SettingRow>
				)}
			</Section>
		</Stack>
	);
}
