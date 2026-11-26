import { z } from "zod";

/**
 * Schema of an audit log as sent by the API. `created_at` is an RFC 3339
 * string.
 *
 * @see https://github.com/yurihbm/go-net-http-auth-base/blob/main/internal/domain/audit.go
 */
export const AuditLogSchema = z.object({
	uuid: z.string(),
	actor_uuid: z.string().optional(),
	ip_address: z.string(),
	user_agent: z.string(),
	action: z.string(),
	resource_type: z.string(),
	resource_uuid: z.string(),
	request_uuid: z.string(),
	changes: z.unknown().optional(),
	status: z.enum(["SUCCESS", "FAILURE"]),
	failure_reason: z.string().optional(),
	created_at: z.string(),
});
