import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { useTranslate } from "@lib/i18n";
import { Container, PageHeader, Stack } from "@lib/ui";
import { AuditLogsList } from "@modules/audit";
import { usePageTitle } from "@modules/shared";

const searchSchema = z.object({
	action: z.string().optional().catch(undefined),
	resourceType: z.string().optional().catch(undefined),
	startDate: z.iso.datetime({ offset: true }).optional().catch(undefined),
	endDate: z.iso.datetime({ offset: true }).optional().catch(undefined),
	status: z.enum(["SUCCESS", "FAILURE"]).optional().catch(undefined),
	actorUuid: z.string().optional().catch(undefined),
});

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/audit-logs/",
)({
	component: AuditLogsComponent,
	validateSearch: searchSchema,
});

const { useNavigate, useSearch } = Route;

function AuditLogsComponent() {
	const filters = useSearch();
	const navigate = useNavigate();
	const t = useTranslate("audit");

	usePageTitle(t("auditPage.title"));

	return (
		<Container size="wide">
			<Stack gap="lg" className="py-6">
				<PageHeader
					title={t("auditPage.title")}
					description={t("auditPage.description")}
				/>
				<AuditLogsList
					filters={filters}
					onFiltersChange={(next) => navigate({ search: next, replace: true })}
				/>
			</Stack>
		</Container>
	);
}
