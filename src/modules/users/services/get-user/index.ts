import { useQuery } from "@tanstack/react-query";

import { client, request } from "@lib/api";
import { UserSchema } from "@modules/users/schemas";
import { toUser } from "@modules/users/utils";

/** Cache key used for the get user query. */
export const getUserKey = "users/get";

/**
 * Hook to fetch a user by UUID (admin or self).
 *
 * @param uuid - The UUID of the user.
 */
export function useGetUser(uuid: string) {
	return useQuery({
		queryKey: [getUserKey, uuid],
		queryFn: async ({ signal }) => {
			const { data } = await request(
				UserSchema,
				client.get(`/users/${uuid}`, { signal }),
			);

			return toUser(data);
		},
	});
}
