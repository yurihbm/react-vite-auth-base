import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { useTranslate } from "@lib/i18n";
import { UsersList } from "@modules/users";

const searchSchema = z.object({
	search: z.string().optional().catch(undefined),
	role: z.enum(["admin", "user"]).optional().catch(undefined),
});

export const Route = createFileRoute("/_authenticated/_admin/admin/users/")({
	component: UsersComponent,
	validateSearch: searchSchema,
});

const { useNavigate, useSearch } = Route;

function UsersComponent() {
	const { search, role } = useSearch();
	const navigate = useNavigate();
	const t = useTranslate("users");

	return (
		<section className="flex w-full flex-col gap-4">
			<h2 className="text-lg font-bold">{t("usersPage.title")}</h2>
			<UsersList
				search={search}
				role={role}
				onFiltersChange={(filters) =>
					navigate({ search: filters, replace: true })
				}
			/>
		</section>
	);
}
