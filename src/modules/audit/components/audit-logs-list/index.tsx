import type { TranslateKey } from "@lib/i18n";
import type { ColumnDef } from "@lib/ui";
import type { AuditLogsFilters } from "@modules/audit/services";
import type { AuditLog, AuditStatus } from "@modules/audit/types";

import {
	CheckCircleIcon,
	FunnelIcon,
	ListChecksIcon,
	XCircleIcon,
} from "@phosphor-icons/react";
import { useCallback, useId, useMemo, useState } from "react";

import { useApiErrorMessage } from "@lib/api";
import { useLanguage, useTranslate } from "@lib/i18n";
import {
	Badge,
	Button,
	Card,
	EmptyState,
	InlineError,
	Select,
	Skeleton,
	Spinner,
	Table,
	Text,
	TextInput,
} from "@lib/ui";
import { ShortUuid } from "@modules/audit/components/short-uuid";
import {
	useAuditLogsList,
	useAuditStatusCounts,
} from "@modules/audit/services";

import { ALL, AUDIT_ACTIONS } from "./constants";
import { styles } from "./styles";

const EMPTY_CELL = "—";
const RESOURCE_TYPES = ["user", "auth"] as const;
const SKELETON_ROWS = 4;

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

function countActiveFilters(filters: AuditLogsFilters) {
	return Object.values(filters).filter(Boolean).length;
}

/** The resource of a log: its type and, when there is one, its short ID. */
function ResourceCell({ log }: { log: AuditLog }) {
	const t = useTranslate("audit");
	const type = log.resourceType;
	const typeLabel =
		type === "user" || type === "auth"
			? t(`auditLogsList.resource.${type}`)
			: type;

	if (!log.resourceUuid) {
		return typeLabel;
	}

	return (
		<span className="inline-flex items-center gap-2">
			{typeLabel}
			<ShortUuid uuid={log.resourceUuid} linkToUser={type === "user"} />
		</span>
	);
}

interface AuditLogsListProps {
	filters: AuditLogsFilters;
	/** Called with the next filters, so the caller can keep them in the URL. */
	onFiltersChange: (filters: AuditLogsFilters) => void;
}

/**
 * AuditLogsList is the admin audit log: collapsible filters (collapsed below
 * `md`), the total with a success/failure summary for the current filters, the
 * logs (a table with a sticky header from `md`, cards below) and a button that
 * loads the next page. While new filters load, the rows stay, dimmed.
 */
export function AuditLogsList({
	filters,
	onFiltersChange,
}: AuditLogsListProps) {
	const t = useTranslate("audit");
	const { language } = useLanguage();
	const filtersId = useId();
	const [filtersOpen, setFiltersOpen] = useState(false);

	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		isPending,
		isPlaceholderData,
	} = useAuditLogsList(filters);
	const { data: counts } = useAuditStatusCounts(filters);
	const apiErrorMessage = useApiErrorMessage(error);

	const logs = useMemo(
		() => data?.pages.flatMap((page) => page.logs) ?? [],
		[data],
	);
	const total = data?.pages[0]?.total;
	const activeFilters = countActiveFilters(filters);

	const formatDate = useMemo(() => {
		const format = new Intl.DateTimeFormat(language, {
			dateStyle: "medium",
			timeStyle: "short",
		});

		return (iso: string) => format.format(new Date(iso));
	}, [language]);

	// Unknown actions (e.g. added to the API later) show their raw name.
	const actionLabel = useCallback(
		(action: string) =>
			t(`auditLogsList.actions.${action}` as TranslateKey<"audit">, {
				defaultValue: action,
			}),
		[t],
	);

	const statusBadge = useCallback(
		(status: AuditStatus) => (
			<Badge size="sm" color={status === "SUCCESS" ? "success" : "danger"}>
				{status === "SUCCESS"
					? t("auditLogsList.status.success")
					: t("auditLogsList.status.failure")}
			</Badge>
		),
		[t],
	);

	const columns = useMemo<ColumnDef<AuditLog>[]>(
		() => [
			{
				accessorKey: "createdAt",
				header: t("auditLogsList.columns.createdAt"),
				cell: ({ row }) => formatDate(row.original.createdAt),
			},
			{
				accessorKey: "action",
				header: t("auditLogsList.columns.action"),
				cell: ({ row }) => actionLabel(row.original.action),
			},
			{
				accessorKey: "status",
				header: t("auditLogsList.columns.status"),
				cell: ({ row }) => statusBadge(row.original.status),
			},
			{
				accessorKey: "actorUuid",
				header: t("auditLogsList.columns.actor"),
				cell: ({ row }) =>
					row.original.actorUuid ? (
						<ShortUuid uuid={row.original.actorUuid} linkToUser />
					) : (
						EMPTY_CELL
					),
			},
			{
				accessorKey: "resourceUuid",
				header: t("auditLogsList.columns.resource"),
				cell: ({ row }) => <ResourceCell log={row.original} />,
			},
		],
		[t, formatDate, actionLabel, statusBadge],
	);

	const actionOptions = [
		{ label: t("auditLogsList.action.all"), value: ALL },
		...AUDIT_ACTIONS.map((action) => ({
			label: actionLabel(action),
			value: action,
		})),
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

	const {
		root,
		toolbarHeader,
		filters: filtersSlot,
		noMessage,
		resultsBar,
		totalGroup,
		summary,
		results,
		table,
		cards,
		card,
		cardHeader,
		skeletons,
		footer,
	} = styles({ open: filtersOpen, stale: isPlaceholderData });

	const clearFiltersButton = (
		<Button size="sm" variant="ghost" onClick={() => onFiltersChange({})}>
			{t("auditLogsList.clearFilters")}
		</Button>
	);

	function renderResults() {
		if (isPending) {
			return (
				<div className={skeletons()}>
					{Array.from({ length: SKELETON_ROWS }, (_, index) => (
						<Skeleton key={index} variant="rect" className="h-12" />
					))}
				</div>
			);
		}

		if (logs.length === 0) {
			if (error) {
				return null;
			}

			return activeFilters > 0 ? (
				<EmptyState
					icon={<FunnelIcon size={24} />}
					title={t("auditLogsList.emptyFiltered.title")}
					description={t("auditLogsList.emptyFiltered.description")}
					action={
						<Button
							size="sm"
							variant="outline"
							onClick={() => onFiltersChange({})}
						>
							{t("auditLogsList.clearFilters")}
						</Button>
					}
				/>
			) : (
				<EmptyState
					icon={<ListChecksIcon size={24} />}
					title={t("auditLogsList.empty")}
				/>
			);
		}

		return (
			<>
				<Table
					data={logs}
					columns={columns}
					sticky
					scroll="page"
					label={t("auditPage.title")}
					className={table()}
				/>
				<ul className={cards()}>
					{logs.map((log) => (
						<li key={log.uuid} className={card()}>
							<div className={cardHeader()}>
								<Text as="span" variant="label">
									{actionLabel(log.action)}
								</Text>
								{statusBadge(log.status)}
							</div>
							<Text as="span" variant="caption">
								{formatDate(log.createdAt)}
							</Text>
							<Text as="span" variant="muted">
								{t("auditLogsList.columns.actor")}:{" "}
								{log.actorUuid ? (
									<ShortUuid uuid={log.actorUuid} linkToUser />
								) : (
									EMPTY_CELL
								)}
							</Text>
							<Text as="span" variant="muted">
								{t("auditLogsList.columns.resource")}:{" "}
								<ResourceCell log={log} />
							</Text>
						</li>
					))}
				</ul>
			</>
		);
	}

	return (
		<div className={root()}>
			<Card>
				<div className={toolbarHeader()}>
					<Button
						size="sm"
						variant="ghost"
						aria-expanded={filtersOpen}
						aria-controls={filtersId}
						onClick={() => setFiltersOpen((open) => !open)}
						className="md:hidden"
					>
						<FunnelIcon aria-hidden="true" size={16} />
						{t("auditLogsList.filters.toggle")}
						{activeFilters > 0 && (
							<Badge size="sm" color="primary">
								{activeFilters}
							</Badge>
						)}
					</Button>
					<Text as="span" variant="label" className="hidden md:inline">
						{t("auditLogsList.filters.title")}
					</Text>
					{activeFilters > 0 && clearFiltersButton}
				</div>
				<div id={filtersId} className={filtersSlot()}>
					<Select
						classNames={{ message: noMessage() }}
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
						classNames={{ message: noMessage() }}
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
						classNames={{ message: noMessage() }}
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
						classNames={{ inputMessage: noMessage() }}
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
						classNames={{ inputMessage: noMessage() }}
						type="datetime-local"
						label={t("auditLogsList.startDate.label")}
						value={toLocalInputValue(filters.startDate)}
						data-empty={!filters.startDate}
						onChange={(event) =>
							onFiltersChange({
								...filters,
								startDate: fromLocalInputValue(event.target.value),
							})
						}
					/>
					<TextInput
						classNames={{ inputMessage: noMessage() }}
						type="datetime-local"
						label={t("auditLogsList.endDate.label")}
						value={toLocalInputValue(filters.endDate)}
						data-empty={!filters.endDate}
						onChange={(event) =>
							onFiltersChange({
								...filters,
								endDate: fromLocalInputValue(event.target.value),
							})
						}
					/>
				</div>
			</Card>
			<div className={resultsBar()}>
				<div className={totalGroup()}>
					{total !== undefined && (
						<Text as="p" variant="muted" aria-live="polite">
							{t("auditLogsList.total", { count: total })}
						</Text>
					)}
					{isFetching && !isPending && !isFetchingNextPage && (
						<Spinner size="sm" label={t("auditLogsList.loading")} />
					)}
				</div>
				{counts && (
					<div
						role="group"
						aria-label={t("auditLogsList.summary.title")}
						className={summary()}
					>
						<Badge color="success">
							<CheckCircleIcon aria-hidden="true" size={14} />
							{counts.success} {t("auditLogsList.summary.succeeded")}
						</Badge>
						<Badge color="danger">
							<XCircleIcon aria-hidden="true" size={14} />
							{counts.failure} {t("auditLogsList.summary.failed")}
						</Badge>
					</div>
				)}
			</div>
			{!!error && <InlineError>{apiErrorMessage}</InlineError>}
			<div aria-busy={isPending || isPlaceholderData} className={results()}>
				{renderResults()}
			</div>
			{hasNextPage && (
				<div className={footer()}>
					<Text variant="muted">
						{t("auditLogsList.showing", {
							loaded: logs.length,
							total: total ?? logs.length,
						})}
					</Text>
					<Button
						variant="outline"
						disabled={isFetchingNextPage}
						onClick={() => fetchNextPage()}
					>
						{isFetchingNextPage
							? t("auditLogsList.loadingMore")
							: t("auditLogsList.loadMore")}
					</Button>
				</div>
			)}
		</div>
	);
}
