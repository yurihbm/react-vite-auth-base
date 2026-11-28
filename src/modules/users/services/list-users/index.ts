import type { RequestParams } from "@lib/api";
import type { UserRole } from "@modules/users/types";

import { useInfiniteQuery } from "@tanstack/react-query";
import { z } from "zod";

import { client, request } from "@lib/api";
import { UserSchema } from "@modules/users/schemas";
import { toUser } from "@modules/users/utils";

/** Filters of the admin users list. Empty values are not sent. */
export interface UsersListFilters {
	/** Case-insensitive prefix of the email or name. */
	search?: string;
	role?: UserRole;
}

/** Cache key used for the users list query. */
export const listUsersKey = "users/list";

/** Hook to list users (admin only) with cursor pagination. */
export function useUsersList({ search, role }: UsersListFilters) {
	return useInfiniteQuery({
		queryKey: [listUsersKey, { search, role }],
		initialPageParam: undefined as string | undefined,
		queryFn: async ({ pageParam, signal }) => {
			const params: RequestParams = {};
			if (search) params.search = search;
			if (role) params.role = role;
			if (pageParam) params.cursor = pageParam;

			const { data, meta } = await request(
				z.array(UserSchema),
				client.get("/users", { params, signal }),
			);

			return {
				users: data.map(toUser),
				total: meta?.total,
				nextCursor: meta?.next_cursor,
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor,
	});
}
