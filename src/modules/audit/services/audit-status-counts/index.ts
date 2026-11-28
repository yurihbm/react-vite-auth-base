import type { AuditLogsFilters } from "@modules/audit/services/list-audit-logs";
import type { AuditStatus } from "@modules/audit/types";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { client, request } from "@lib/api";
import { AuditLogSchema } from "@modules/audit/schemas";
import { toAuditLogsParams } from "@modules/audit/services/list-audit-logs";

export interface AuditStatusCounts {
	success: number;
	failure: number;
}

/** Total of logs with `status` under the filters, from a one-row page. */
async function countByStatus(
	filters: AuditLogsFilters,
	status: AuditStatus,
	signal?: AbortSignal,
) {
	const { meta } = await request(
		z.array(AuditLogSchema),
		client.get("/audit-logs", {
			params: { ...toAuditLogsParams(filters), status, limit: 1 },
			signal,
		}),
	);

	return meta?.total ?? 0;
}

/** The unique query key used for caching the audit status counts. */
export const auditStatusCountsKey = "audit/status-counts";

/**
 * Counts the audit logs that succeeded and failed under `filters`, using the
 * API's totals (one-row pages), so the numbers cover every matching log and not
 * only the loaded ones.
 */
export function useAuditStatusCounts(filters: AuditLogsFilters) {
	const { action, resourceType, status, actorUuid, startDate, endDate } =
		filters;
	const key = { action, resourceType, status, actorUuid, startDate, endDate };

	return useQuery({
		queryKey: [auditStatusCountsKey, key],
		queryFn: async ({ signal }): Promise<AuditStatusCounts> => {
			const [success, failure] = await Promise.all(
				(["SUCCESS", "FAILURE"] as const).map((value) =>
					key.status && key.status !== value
						? 0
						: countByStatus(key, value, signal),
				),
			);

			return { success, failure };
		},
		placeholderData: keepPreviousData,
	});
}
