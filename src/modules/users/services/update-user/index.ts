import type { User } from "@modules/users/types";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client, request } from "@lib/api";
import { UserSchema } from "@modules/users/schemas";
import { getMeKey } from "@modules/users/services/get-me";
import { toUser } from "@modules/users/utils";

/** Data required to update a user. */
interface UpdateUserData {
	/** The UUID of the user to update. */
	uuid: string;
	/** The new name. */
	name: string;
}

/**
 * Sends a PUT request to update a user's name.
 *
 * @param data - The user UUID and the new name.
 * @returns A promise that resolves to the updated `User`.
 */
async function updateUser({ uuid, name }: UpdateUserData) {
	const { data } = await request(
		UserSchema,
		client.put(`/users/${uuid}`, { data: { name } }),
	);

	return toUser(data);
}

/** Cache key used for the update user mutation. */
export const updateUserKey = "users/update";

/**
 * Hook to manage the update user mutation state using TanStack Query.
 *
 * @remarks
 *   When the updated user is the current user, the cached profile is replaced.
 */
export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [updateUserKey],
		mutationFn: updateUser,
		onSuccess: (user) => {
			queryClient.setQueryData<User>([getMeKey], (me) =>
				me?.uuid === user.uuid ? user : me,
			);
		},
	});
}
