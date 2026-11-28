import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { useTranslate } from "@lib/i18n";
import { Container, PageHeader, Stack } from "@lib/ui";
import { usePageTitle } from "@modules/shared";
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

	usePageTitle(t("usersPage.title"));

	return (
		<Container size="wide">
			<Stack gap="lg" className="py-6">
				<PageHeader
					title={t("usersPage.title")}
					description={t("usersPage.description")}
				/>
				<UsersList
					search={search}
					role={role}
					onFiltersChange={(filters) =>
						navigate({ search: filters, replace: true })
					}
				/>
			</Stack>
		</Container>
	);
}
