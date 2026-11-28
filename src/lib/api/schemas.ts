import type { APIResponseBody } from "./types";

import { z } from "zod";

import { APIError } from "./error";

/** Schema of the `meta` object of paginated responses. */
export const apiResponseMetaSchema = z.object({
	total: z.number().optional(),
	limit: z.number().optional(),
	next_cursor: z.string().optional(),
});

/**
 * Builds the schema of the API response envelope around a `data` schema.
 *
 * @param data - The schema of the `data` field. Use `z.undefined()` for 204.
 */
export function apiEnvelopeSchema<Data extends z.ZodType>(data: Data) {
	return z.object({
		data,
		message: z.string(),
		meta: apiResponseMetaSchema.optional(),
	});
}

/**
 * Awaits an API call and validates its `data` against a schema, so callers get
 * a typed value instead of trusting the wire.
 *
 * @example
 * 	```ts
 * 	const { data } = await request(UserSchema, client.get("/users/me"));
 * 	```;
 *
 * @param schema - The schema of the response `data`.
 * @param call - The pending API call.
 * @returns The response envelope with `data` typed by the schema.
 * @throws {APIError} With key `client.invalidResponse` if `data` does not match
 *   the schema. Errors from the call itself propagate unchanged.
 */
export async function request<Data extends z.ZodType>(
	schema: Data,
	call: Promise<APIResponseBody<unknown>>,
): Promise<APIResponseBody<z.infer<Data>>> {
	const response = await call;
	const parsed = schema.safeParse(response.data);

	if (!parsed.success) {
		throw new APIError("client.invalidResponse", {
			status: 200,
			key: "client.invalidResponse",
		});
	}

	return { ...response, data: parsed.data };
}
