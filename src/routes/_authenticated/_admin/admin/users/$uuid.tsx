import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Skeleton } from "@lib/ui";
import { useAuth } from "@modules/auth";
import {
	DeleteAccount,
	DeleteUser,
	EditNameForm,
	useGetUser,
} from "@modules/users";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/users/$uuid",
)({
	component: UserComponent,
});

const { useParams } = Route;

function UserComponent() {
	const { uuid } = useParams();
	const { user: me } = useAuth<true>();
	const navigate = useNavigate();
	const t = useTranslate("users");

	const { data: user, error, isPending } = useGetUser(uuid);
	const apiErrorMessage = useApiErrorMessage(error);

	return (
		<section className="mx-auto flex w-full flex-col gap-4 sm:max-w-sm">
			<h2 className="text-lg font-bold">{t("userPage.title")}</h2>
			<Link to="/admin/users" search={{}} className="text-sm underline">
				{t("userPage.back")}
			</Link>
			{isPending && <Skeleton variant="rect" className="h-40" />}
			{!!error && <p className="text-danger">{apiErrorMessage}</p>}
			{user && (
				<>
					<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
						<dt className="font-medium">{t("accountPage.profile.email")}</dt>
						<dd>{user.email}</dd>
						<dt className="font-medium">{t("accountPage.profile.role")}</dt>
						<dd>{user.role}</dd>
						<dt className="font-medium">
							{t("accountPage.profile.memberSince")}
						</dt>
						<dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
					</dl>
					<EditNameForm key={user.uuid} user={user} />
					{user.uuid === me.uuid ? (
						<DeleteAccount uuid={user.uuid} />
					) : (
						<DeleteUser
							uuid={user.uuid}
							onDeleted={() => navigate({ to: "/admin/users", search: {} })}
						/>
					)}
				</>
			)}
		</section>
	);
}
