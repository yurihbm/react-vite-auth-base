import { createAPIClient } from "./client";

/**
 * The API client instance that can be used to make requests to the API.
 */
export const client = createAPIClient();

export { APIError } from "./error";
export type {
	APIClient,
	APIResponseBody,
	APIResponseMeta,
	RequestParams,
} from "./types";
