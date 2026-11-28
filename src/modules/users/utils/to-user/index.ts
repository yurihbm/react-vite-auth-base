import type { UserSchema } from "@modules/users/schemas";
import type { User } from "@modules/users/types";
import type { z } from "zod";

/**
 * Converts a user as sent by the API into a `User`.
 *
 * @param data - The user parsed with `UserSchema`.
 * @returns A `User` object with ISO-formatted dates.
 */
export function toUser(data: z.infer<typeof UserSchema>): User {
	return {
		uuid: data.uuid,
		name: data.name,
		email: data.email,
		role: data.role,
		// The API sends unix seconds.
		createdAt: new Date(data.created_at * 1000).toISOString(),
		updatedAt: new Date(data.updated_at * 1000).toISOString(),
	};
}
