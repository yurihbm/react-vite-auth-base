import type { ColumnDef } from "@lib/ui";
import type { User, UserRole } from "@modules/users/types";

import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import {
	Badge,
	Select,
	Skeleton,
	Table,
	TextInput,
	useDebouncedValue,
} from "@lib/ui";
import { errorMessage } from "@modules/users/components/styles";
import { useUsersList } from "@modules/users/services";

const ROW_HEIGHT = 48;
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
 * UsersList is the admin users table: filters, total and an infinite,
 * virtualized list that loads the next page when the scroll reaches the end.
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
		isFetchingNextPage,
		isPending,
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

	function handleEndReached() {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-end gap-4">
				<TextInput
					label={t("usersList.search.label")}
					placeholder={t("usersList.search.placeholder")}
					value={searchInput}
					onChange={(event) => setSearchInput(event.target.value)}
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
				/>
				{total !== undefined && (
					<p className="text-sm text-foreground-muted">
						{t("usersList.total", { total })}
					</p>
				)}
			</div>
			{!!error && <p className={errorMessage()}>{apiErrorMessage}</p>}
			{isPending ? (
				<Skeleton variant="rect" className="h-[60vh]" />
			) : (
				<Table
					data={users}
					columns={columns}
					sticky
					className="h-[60vh]"
					emptyState={t("usersList.empty")}
					virtualize={{ rowHeight: ROW_HEIGHT, onEndReached: handleEndReached }}
				/>
			)}
		</div>
	);
}
