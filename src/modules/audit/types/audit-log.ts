export type AuditStatus = "SUCCESS" | "FAILURE";

export interface AuditLog {
	uuid: string;
	/** Absent for system or anonymous actions. */
	actorUuid?: string;
	ipAddress: string;
	userAgent: string;
	action: string;
	resourceType: string;
	resourceUuid: string;
	requestUuid: string;
	changes?: unknown;
	status: AuditStatus;
	failureReason?: string;
	/** RFC 3339 timestamp. */
	createdAt: string;
}
