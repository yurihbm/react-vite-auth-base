import type { ColumnDef } from "@lib/ui";
import type { AuditLogsFilters } from "@modules/audit/services";
import type { AuditLog, AuditStatus } from "@modules/audit/types";

import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { useApiErrorMessage } from "@lib/api";
import { PieChart } from "@lib/charts";
import { useTranslate } from "@lib/i18n";
import { Badge, Select, Skeleton, Table, TextInput } from "@lib/ui";
import { useAuditLogsList } from "@modules/audit/services";

import { ALL, AUDIT_ACTIONS, ROW_HEIGHT } from "./constants";

const EMPTY_CELL = "—";
const RESOURCE_TYPES = ["user", "auth"] as const;

/** Formats an RFC 3339 timestamp as the value of a `datetime-local` input. */
function toLocalInputValue(iso?: string) {
	if (!iso) return "";

	const date = new Date(iso);
	const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

	return local.toISOString().slice(0, 16);
}

/** Parses a `datetime-local` input value into an RFC 3339 timestamp. */
function fromLocalInputValue(value: string) {
	return value ? new Date(value).toISOString() : undefined;
}

interface AuditLogsListProps {
	filters: AuditLogsFilters;
	/** Called with the next filters, so the caller can keep them in the URL. */
	onFiltersChange: (filters: AuditLogsFilters) => void;
}

function UserLink({ uuid }: { uuid: string }) {
	return (
		<Link to="/admin/users/$uuid" params={{ uuid }} className="underline">
			{uuid}
		</Link>
	);
}

/**
 * AuditLogsList is the admin audit table: filters, total, a summary of the
 * loaded logs by status and an infinite, virtualized list that loads the next
 * page when the scroll reaches the end.
 */
export function AuditLogsList({
	filters,
	onFiltersChange,
}: AuditLogsListProps) {
	const t = useTranslate("audit");

	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
	} = useAuditLogsList(filters);
	const apiErrorMessage = useApiErrorMessage(error);

	const logs = useMemo(
		() => data?.pages.flatMap((page) => page.logs) ?? [],
		[data],
	);
	const total = data?.pages[0]?.total;

	const statusSlices = useMemo(() => {
		const failures = logs.filter((log) => log.status === "FAILURE").length;

		return [
			{
				key: "SUCCESS",
				label: t("auditLogsList.status.success"),
				value: logs.length - failures,
				className: "text-success",
			},
			{
				key: "FAILURE",
				label: t("auditLogsList.status.failure"),
				value: failures,
				className: "text-danger",
			},
		].filter((slice) => slice.value > 0);
	}, [logs, t]);

	const columns = useMemo<ColumnDef<AuditLog>[]>(
		() => [
			{
				accessorKey: "createdAt",
				header: t("auditLogsList.columns.createdAt"),
				cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
			},
			{ accessorKey: "action", header: t("auditLogsList.columns.action") },
			{
				accessorKey: "status",
				header: t("auditLogsList.columns.status"),
				cell: ({ row }) => (
					<Badge
						color={row.original.status === "SUCCESS" ? "success" : "danger"}
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "actorUuid",
				header: t("auditLogsList.columns.actor"),
				cell: ({ row }) =>
					row.original.actorUuid ? (
						<UserLink uuid={row.original.actorUuid} />
					) : (
						EMPTY_CELL
					),
			},
			{
				accessorKey: "resourceUuid",
				header: t("auditLogsList.columns.resource"),
				cell: ({ row }) =>
					row.original.resourceType === "user" && row.original.resourceUuid ? (
						<UserLink uuid={row.original.resourceUuid} />
					) : (
						`${row.original.resourceType} ${row.original.resourceUuid}`.trim()
					),
			},
		],
		[t],
	);

	const actionOptions = [
		{ label: t("auditLogsList.action.all"), value: ALL },
		...AUDIT_ACTIONS.map((action) => ({ label: action, value: action })),
	];
	const resourceOptions = [
		{ label: t("auditLogsList.resource.all"), value: ALL },
		...RESOURCE_TYPES.map((type) => ({
			label: t(`auditLogsList.resource.${type}`),
			value: type,
		})),
	];
	const statusOptions = [
		{ label: t("auditLogsList.status.all"), value: ALL },
		{ label: t("auditLogsList.status.success"), value: "SUCCESS" },
		{ label: t("auditLogsList.status.failure"), value: "FAILURE" },
	];

	function handleEndReached() {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-start gap-4">
				<Select
					label={t("auditLogsList.action.label")}
					options={actionOptions}
					value={filters.action ?? ALL}
					onChange={(value) =>
						onFiltersChange({
							...filters,
							action: value === ALL ? undefined : (value ?? undefined),
						})
					}
				/>
				<Select
					label={t("auditLogsList.resource.label")}
					options={resourceOptions}
					value={filters.resourceType ?? ALL}
					onChange={(value) =>
						onFiltersChange({
							...filters,
							resourceType: value === ALL ? undefined : (value ?? undefined),
						})
					}
				/>
				<Select
					label={t("auditLogsList.status.label")}
					options={statusOptions}
					value={filters.status ?? ALL}
					onChange={(value) =>
						onFiltersChange({
							...filters,
							status: value === ALL ? undefined : (value as AuditStatus),
						})
					}
				/>
				<TextInput
					label={t("auditLogsList.actor.label")}
					placeholder={t("auditLogsList.actor.placeholder")}
					value={filters.actorUuid ?? ""}
					onChange={(event) =>
						onFiltersChange({
							...filters,
							actorUuid: event.target.value || undefined,
						})
					}
				/>
				<TextInput
					type="datetime-local"
					label={t("auditLogsList.startDate.label")}
					value={toLocalInputValue(filters.startDate)}
					onChange={(event) =>
						onFiltersChange({
							...filters,
							startDate: fromLocalInputValue(event.target.value),
						})
					}
				/>
				<TextInput
					type="datetime-local"
					label={t("auditLogsList.endDate.label")}
					value={toLocalInputValue(filters.endDate)}
					onChange={(event) =>
						onFiltersChange({
							...filters,
							endDate: fromLocalInputValue(event.target.value),
						})
					}
				/>
				{total !== undefined && (
					<p className="mt-6 flex h-[42px] items-center text-sm text-foreground-muted">
						{t("auditLogsList.total", { total })}
					</p>
				)}
			</div>
			{!!error && <p className="text-danger">{apiErrorMessage}</p>}
			{statusSlices.length > 0 && (
				<section className="flex flex-col gap-2">
					<h3 className="font-bold">{t("auditLogsList.summary.title")}</h3>
					<PieChart data={statusSlices} height={200} />
				</section>
			)}
			{isPending ? (
				<Skeleton variant="rect" className="h-[60vh]" />
			) : (
				<Table
					data={logs}
					columns={columns}
					sticky
					className="h-[60vh]"
					emptyState={t("auditLogsList.empty")}
					virtualize={{ rowHeight: ROW_HEIGHT, onEndReached: handleEndReached }}
				/>
			)}
		</div>
	);
}
