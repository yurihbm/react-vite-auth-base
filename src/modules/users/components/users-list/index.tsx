import type { ColumnDef } from "@lib/ui";
import type { User, UserRole } from "@modules/users/types";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
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
	useDebouncedValue,
} from "@lib/ui";
import { useUsersList } from "@modules/users/services";

import { styles } from "./styles";

const SKELETON_ROWS = 3;
const ALL_ROLES = "all";
const SEARCH_DEBOUNCE_MS = 300;

interface UsersListFilters {
	search?: string;
	role?: UserRole;
}

interface UsersListProps extends UsersListFilters {
	/** Called with the next filters, so the caller can keep them in the URL. */
	onFiltersChange: (filters: UsersListFilters) => void;
}

/**
 * UsersList is the admin users list: a filter toolbar, the total, the users (a
 * table from `md`, cards below) and a button that loads the next page. While
 * new filters load, the current rows stay on screen, dimmed.
 */
export function UsersList({ search, role, onFiltersChange }: UsersListProps) {
	const t = useTranslate("users");

	const [searchInput, setSearchInput] = useState(search ?? "");
	const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

	// Follow the URL when it changes from outside (e.g. back navigation), but
	// not when it only caught up with the text typed here.
	const [previousSearch, setPreviousSearch] = useState(search);
	if (search !== previousSearch) {
		setPreviousSearch(search);
		if (search !== (searchInput || undefined)) {
			setSearchInput(search ?? "");
		}
	}

	const latest = useRef({ search, role, onFiltersChange });
	useEffect(() => {
		latest.current = { search, role, onFiltersChange };
	});

	useEffect(() => {
		const next = debouncedSearch || undefined;
		const current = latest.current;

		if (next !== current.search) {
			current.onFiltersChange({ search: next, role: current.role });
		}
	}, [debouncedSearch]);

	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		isPending,
		isPlaceholderData,
	} = useUsersList({ search, role });
	const apiErrorMessage = useApiErrorMessage(error);

	const users = useMemo(
		() => data?.pages.flatMap((page) => page.users) ?? [],
		[data],
	);
	const total = data?.pages[0]?.total;

	const columns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: "name",
				header: t("usersList.columns.name"),
				cell: ({ row }) => (
					<Link
						to="/admin/users/$uuid"
						params={{ uuid: row.original.uuid }}
						className="underline"
					>
						{row.original.name}
					</Link>
				),
			},
			{ accessorKey: "email", header: t("usersList.columns.email") },
			{
				accessorKey: "role",
				header: t("usersList.columns.role"),
				cell: ({ row }) => (
					<Badge color={row.original.role === "admin" ? "primary" : "subtle"}>
						{row.original.role}
					</Badge>
				),
			},
			{
				accessorKey: "createdAt",
				header: t("usersList.columns.createdAt"),
				cell: ({ row }) =>
					new Date(row.original.createdAt).toLocaleDateString(),
			},
		],
		[t],
	);

	const roleOptions = [
		{ label: t("usersList.role.all"), value: ALL_ROLES },
		{ label: t("usersList.role.admin"), value: "admin" },
		{ label: t("usersList.role.user"), value: "user" },
	];

	const hasFilters = !!search || !!role;
	const {
		root,
		toolbar,
		search: searchSlot,
		role: roleSlot,
		noMessage,
		resultsBar,
		results,
		table,
		cards,
		card,
		cardName,
		cardMeta,
		skeletons,
		footer,
	} = styles({ stale: isPlaceholderData });

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

		if (users.length === 0) {
			if (error) {
				return null;
			}

			return hasFilters ? (
				<EmptyState
					icon={<MagnifyingGlassIcon size={24} />}
					title={t("usersList.emptyFiltered.title")}
					description={t("usersList.emptyFiltered.description")}
					action={
						<Button
							size="sm"
							variant="outline"
							onClick={() => onFiltersChange({})}
						>
							{t("usersList.clearFilters")}
						</Button>
					}
				/>
			) : (
				<EmptyState title={t("usersList.empty")} />
			);
		}

		return (
			<>
				<Table data={users} columns={columns} className={table()} />
				<ul className={cards()}>
					{users.map((user) => (
						<li key={user.uuid}>
							<Link
								to="/admin/users/$uuid"
								params={{ uuid: user.uuid }}
								className={card()}
							>
								<span className={cardName()}>{user.name}</span>
								<Text as="span" variant="muted">
									{user.email}
								</Text>
								<span className={cardMeta()}>
									<Badge
										size="sm"
										color={user.role === "admin" ? "primary" : "subtle"}
									>
										{user.role}
									</Badge>
									<Text as="span" variant="caption">
										{new Date(user.createdAt).toLocaleDateString()}
									</Text>
								</span>
							</Link>
						</li>
					))}
				</ul>
			</>
		);
	}

	return (
		<div className={root()}>
			<Card>
				<div className={toolbar()}>
					<TextInput
						type="text"
						label={t("usersList.search.label")}
						placeholder={t("usersList.search.placeholder")}
						startIcon={<MagnifyingGlassIcon aria-hidden="true" size={18} />}
						value={searchInput}
						onChange={(event) => setSearchInput(event.target.value)}
						classNames={{
							labelContainer: searchSlot(),
							inputMessage: noMessage(),
						}}
					/>
					<Select
						label={t("usersList.role.label")}
						options={roleOptions}
						value={role ?? ALL_ROLES}
						onChange={(value) =>
							onFiltersChange({
								search,
								role: value === "admin" || value === "user" ? value : undefined,
							})
						}
						classNames={{ root: roleSlot(), message: noMessage() }}
					/>
				</div>
			</Card>
			<div className={resultsBar()}>
				{total !== undefined && (
					<Text as="p" variant="muted" aria-live="polite">
						{t("usersList.total", { total })}
					</Text>
				)}
				{isFetching && !isPending && !isFetchingNextPage && (
					<Spinner size="sm" label={t("usersList.loading")} />
				)}
			</div>
			{!!error && <InlineError>{apiErrorMessage}</InlineError>}
			<div aria-busy={isPending || isPlaceholderData} className={results()}>
				{renderResults()}
			</div>
			{hasNextPage && (
				<div className={footer()}>
					<Text variant="muted">
						{t("usersList.showing", {
							loaded: users.length,
							total: total ?? users.length,
						})}
					</Text>
					<Button
						variant="outline"
						disabled={isFetchingNextPage}
						onClick={() => fetchNextPage()}
					>
						{isFetchingNextPage
							? t("usersList.loadingMore")
							: t("usersList.loadMore")}
					</Button>
				</div>
			)}
		</div>
	);
}
