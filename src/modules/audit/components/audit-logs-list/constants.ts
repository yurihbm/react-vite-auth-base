import { translationKey } from "@lib/i18n";

/** Actions the API records, used as the action filter options. */
export const AUDIT_ACTIONS = [
	"USER_CREATE",
	"USER_UPDATE",
	"USER_DELETE",
	"USER_ROLE_CHANGE",
	"LOGIN",
	"OAUTH_LOGIN",
	"LOGOUT",
	"SIGNUP_REQUEST",
	"EMAIL_CHANGE_REQUEST",
	"EMAIL_CHANGE",
	"EMAIL_CHANGE_REVERT",
	"OAUTH_LINK_REVERT",
	"STEP_UP_REQUEST",
	"STEP_UP_VERIFY",
	"LOGOUT_OTHERS",
	"PASSWORD_RESET_REQUEST",
	"PASSWORD_RESET",
	"PASSWORD_CHANGE",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const ALL = "all";

/**
 * The action labels, read by the dynamic `auditLogsList.actions.<ACTION>` key.
 * Listing them here keeps them in the locale files when extracting.
 */
export const AUDIT_ACTION_LABEL_KEYS = [
	translationKey<"audit">("audit:auditLogsList.actions.USER_CREATE"),
	translationKey<"audit">("audit:auditLogsList.actions.USER_UPDATE"),
	translationKey<"audit">("audit:auditLogsList.actions.USER_DELETE"),
	translationKey<"audit">("audit:auditLogsList.actions.USER_ROLE_CHANGE"),
	translationKey<"audit">("audit:auditLogsList.actions.LOGIN"),
	translationKey<"audit">("audit:auditLogsList.actions.OAUTH_LOGIN"),
	translationKey<"audit">("audit:auditLogsList.actions.LOGOUT"),
	translationKey<"audit">("audit:auditLogsList.actions.SIGNUP_REQUEST"),
	translationKey<"audit">("audit:auditLogsList.actions.EMAIL_CHANGE_REQUEST"),
	translationKey<"audit">("audit:auditLogsList.actions.EMAIL_CHANGE"),
	translationKey<"audit">("audit:auditLogsList.actions.EMAIL_CHANGE_REVERT"),
	translationKey<"audit">("audit:auditLogsList.actions.OAUTH_LINK_REVERT"),
	translationKey<"audit">("audit:auditLogsList.actions.STEP_UP_REQUEST"),
	translationKey<"audit">("audit:auditLogsList.actions.STEP_UP_VERIFY"),
	translationKey<"audit">("audit:auditLogsList.actions.LOGOUT_OTHERS"),
	translationKey<"audit">("audit:auditLogsList.actions.PASSWORD_RESET_REQUEST"),
	translationKey<"audit">("audit:auditLogsList.actions.PASSWORD_RESET"),
	translationKey<"audit">("audit:auditLogsList.actions.PASSWORD_CHANGE"),
];
