import type { APIClient, APIResponseBody, RequestParams } from "./types";

import {
	CREDENTIALS_MODE,
	DEFAULT_ERROR_MESSAGE,
	DEFAULT_TIMEOUT,
	EMPTY_RESPONSE_MESSAGE,
} from "./constants";
import { APIError } from "./error";

/**
 * Parses the given endpoint and query parameters into a full URL string.
 * Adds a leading slash to the endpoint if it doesn't already have one.
 *
 * @param endpoint - The API endpoint to be appended to the base URL.
 * @param params - An optional object containing query parameters to be
 * included in the URL.
 *
 * @return A string representing the full URL with the endpoint and query
 * parameters.
 */
function parseURL(endpoint: string, params?: RequestParams): string {
	endpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
	const url = new URL(endpoint, import.meta.env.VITE_API_BASE_URL);

	if (!params) {
		return url.toString();
	}

	for (const [key, value] of Object.entries(params)) {
		url.searchParams.append(key, String(value));
	}

	return url.toString();
}

/**
 * Parses the response from the API and returns the data if the response is
 * successful, or throws an APIError if the response indicates an error.
 *
 * For status code 204 (No Content), the function returns an object with `data`
 * set to `undefined` and a message indicating that the response is empty.
 *
 * @param response - The Response object returned from the fetch call.
 *
 * @return A promise that resolves to the data from the response if successful,
 * or rejects with an APIError if the response indicates an error.
 */
async function parseResponse<T>(
	response: Response,
): Promise<APIResponseBody<T>> {
	if (response.ok) {
		// 204 is No Content, which means the request was successful but there is
		// no data to return.
		if (response.status === 204) {
			return {
				data: undefined as unknown as T,
				message: EMPTY_RESPONSE_MESSAGE,
			};
		}

		try {
			const data: APIResponseBody<T> = await response.json();
			return data;
		} catch {
			throw new APIError(DEFAULT_ERROR_MESSAGE);
		}
	}

	try {
		const data: APIResponseBody | undefined = await response.json();
		throw new APIError(data?.error ?? DEFAULT_ERROR_MESSAGE, data?.details);
	} catch (err) {
		if (err instanceof APIError) {
			throw err;
		}

		throw new APIError(DEFAULT_ERROR_MESSAGE);
	}
}

/**
 * Ensures that an AbortSignal is provided, and if not, creates a new one with
 * a default timeout.
 *
 * @param signal - An optional AbortSignal to be used for the request.
 */
function ensureSignal(signal?: AbortSignal): AbortSignal {
	if (!signal) {
		return AbortSignal.timeout(DEFAULT_TIMEOUT);
	}

	return signal;
}

/**
 * Creates an API client with methods for making HTTP requests to the API.
 *
 * @return The client object.
 */
export function createAPIClient(): APIClient {
	return {
		post: async (endpoint, { data, signal }) => {
			const response = await fetch(parseURL(endpoint), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				credentials: CREDENTIALS_MODE,
				signal: ensureSignal(signal),
			});

			return parseResponse(response);
		},
		get: async (
			endpoint,
			{ params, signal } = { params: undefined, signal: undefined },
		) => {
			const response = await fetch(parseURL(endpoint, params), {
				method: "GET",
				credentials: CREDENTIALS_MODE,
				signal: ensureSignal(signal),
			});

			return parseResponse(response);
		},
		patch: async (endpoint, { data, signal }) => {
			const response = await fetch(parseURL(endpoint), {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				credentials: CREDENTIALS_MODE,
				signal: ensureSignal(signal),
			});

			return parseResponse(response);
		},
		put: async (endpoint, { data, signal }) => {
			const response = await fetch(parseURL(endpoint), {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
				credentials: CREDENTIALS_MODE,
				signal: ensureSignal(signal),
			});

			return parseResponse(response);
		},
		delete: async (
			endpoint,
			{ params, signal } = { params: undefined, signal: undefined },
		) => {
			const response = await fetch(parseURL(endpoint, params), {
				method: "DELETE",
				credentials: CREDENTIALS_MODE,
				signal: ensureSignal(signal),
			});

			return parseResponse(response);
		},
	};
}
