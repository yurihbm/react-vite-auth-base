import { createAPIClient } from "./client";

/** The API client instance that can be used to make requests to the API. */
export const client = createAPIClient();

export { ERROR_KEYS } from "./error-keys";
export { APIError } from "./error";
export type { APIErrorOptions } from "./error";
export { useApiErrorMessage } from "./hooks";
export { shouldRetryQuery } from "./retry";
export { apiEnvelopeSchema, apiResponseMetaSchema, request } from "./schemas";
export type {
	APIClient,
	APIResponseBody,
	APIResponseMeta,
	RequestParams,
} from "./types";
