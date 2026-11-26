import type { RequestParams } from "@lib/api";
import type { AuditLog, AuditStatus } from "@modules/audit/types";

import { useInfiniteQuery } from "@tanstack/react-query";
import { z } from "zod";

import { client, request } from "@lib/api";
import { AuditLogSchema } from "@modules/audit/schemas";

/** Filters of the audit logs list. Empty values are not sent. */
export interface AuditLogsFilters {
	action?: string;
	resourceType?: string;
	status?: AuditStatus;
	actorUuid?: string;
	/** RFC 3339, inclusive. */
	startDate?: string;
	/** RFC 3339, exclusive. */
	endDate?: string;
}

/** Cache key used for the audit logs list query. */
export const listAuditLogsKey = "audit/list";

/** Hook to list audit logs (admin only) with cursor pagination. */
export function useAuditLogsList(filters: AuditLogsFilters) {
	const { action, resourceType, status, actorUuid, startDate, endDate } =
		filters;

	return useInfiniteQuery({
		queryKey: [
			listAuditLogsKey,
			{ action, resourceType, status, actorUuid, startDate, endDate },
		],
		initialPageParam: undefined as string | undefined,
		queryFn: async ({ pageParam, signal }) => {
			const params: RequestParams = {};
			if (action) params.action = action;
			if (resourceType) params.resource_type = resourceType;
			if (status) params.status = status;
			if (actorUuid) params.actor_uuid = actorUuid;
			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;
			if (pageParam) params.cursor = pageParam;

			const { data, meta } = await request(
				z.array(AuditLogSchema),
				client.get("/audit-logs", { params, signal }),
			);

			return {
				logs: data.map((log): AuditLog => ({
					uuid: log.uuid,
					actorUuid: log.actor_uuid,
					ipAddress: log.ip_address,
					userAgent: log.user_agent,
					action: log.action,
					resourceType: log.resource_type,
					resourceUuid: log.resource_uuid,
					requestUuid: log.request_uuid,
					changes: log.changes,
					status: log.status,
					failureReason: log.failure_reason,
					createdAt: log.created_at,
				})),
				total: meta?.total,
				nextCursor: meta?.next_cursor,
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
	});
}
