import { z } from "zod";

/**
 * Schema of a user as sent by the API. Timestamps are unix **seconds**.
 *
 * @see https://github.com/yurihbm/go-net-http-auth-base/blob/main/internal/domain/users.go
 */
export const UserSchema = z.object({
	uuid: z.uuid(),
	name: z.string(),
	email: z.string(),
	role: z.enum(["admin", "user"]),
	created_at: z.number(),
	updated_at: z.number(),
});
