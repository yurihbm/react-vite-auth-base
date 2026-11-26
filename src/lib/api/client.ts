import type { APIClient, APIResponseBody, RequestParams } from "./types";

import {
	CREDENTIALS_MODE,
	DEFAULT_ERROR_MESSAGE,
	DEFAULT_TIMEOUT,
	EMPTY_RESPONSE_MESSAGE,
	MESSAGE_KEY_PATTERN,
	REFRESH_ENDPOINT,
	REFRESH_LOCK_NAME,
	UNAUTHORIZED_KEY,
} from "./constants";
import { APIError } from "./error";

/**
 * Parses the given endpoint and query parameters into a full URL string. Adds a
 * leading slash to the endpoint if it doesn't already have one.
 *
 * @param endpoint - The API endpoint to be appended to the base URL.
 * @param params - An optional object containing query parameters to be included
 *   in the URL.
 * @returns A string representing the full URL with the endpoint and query
 *   parameters.
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

function isMessageKey(value: unknown): value is string {
	return typeof value === "string" && MESSAGE_KEY_PATTERN.test(value);
}

/**
 * Resolves the message key of an error response. The API normally sends it in
 * `error`, but some middlewares send it in `message`, so both are checked.
 * Falls back to `http.<status>`.
 */
function resolveKey(
	body: { error?: unknown; message?: unknown } | undefined,
	status: number,
): string {
	if (isMessageKey(body?.error)) {
		return body.error;
	}

	if (isMessageKey(body?.message)) {
		return body.message;
	}

	return `http.${status}`;
}

/** Parses a numeric `Retry-After` header (seconds). HTTP dates are ignored. */
function parseRetryAfter(response: Response): number | undefined {
	const header = response.headers.get("Retry-After");

	if (!header || !/^\d+$/.test(header)) {
		return undefined;
	}

	return Number(header);
}

/** Builds the APIError for a non-2xx response. */
async function parseError(response: Response): Promise<APIError> {
	let body: APIResponseBody | undefined;

	try {
		body = await response.json();
	} catch {
		body = undefined;
	}

	const key = resolveKey(body, response.status);
	const hasKey = !key.startsWith("http.");

	return new APIError(hasKey ? key : DEFAULT_ERROR_MESSAGE, {
		status: response.status,
		key,
		details: body?.details,
		retryAfter: parseRetryAfter(response),
	});
}

/**
 * Parses the response from the API and returns the data if the response is
 * successful, or throws an APIError if the response indicates an error.
 *
 * For status code 204 (No Content), the function returns an object with `data`
 * set to `undefined` and a message indicating that the response is empty.
 *
 * @param response - The Response object returned from the fetch call.
 * @returns A promise that resolves to the data from the response if successful,
 *   or rejects with an APIError if the response indicates an error.
 */
async function parseResponse<T>(
	response: Response,
): Promise<APIResponseBody<T>> {
	if (!response.ok) {
		throw await parseError(response);
	}

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
		throw new APIError("client.invalidResponse", {
			status: response.status,
			key: "client.invalidResponse",
		});
	}
}

/**
 * Ensures that an AbortSignal is provided, and if not, creates a new one with a
 * default timeout.
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
 * Calls fetch, translating transport failures into APIErrors. Aborts requested
 * by the caller are rethrown untouched so query cancellation keeps working.
 */
async function safeFetch(url: string, init: RequestInit): Promise<Response> {
	try {
		return await fetch(url, init);
	} catch (err) {
		if (err instanceof DOMException && err.name === "TimeoutError") {
			throw new APIError("client.timeout", { key: "client.timeout" });
		}

		if (err instanceof TypeError) {
			throw new APIError("client.network", { key: "client.network" });
		}

		throw err;
	}
}

interface SendOptions {
	data?: unknown;
	params?: RequestParams;
	signal?: AbortSignal;
}

/**
 * Creates an API client with methods for making HTTP requests to the API.
 *
 * When a request fails with `auth.unauthorized` (expired access token), the
 * client renews the session through `/auth/refresh` and replays the request
 * once. Concurrent failures share a single refresh, which is also serialized
 * across browser tabs with the Web Locks API, because the backend revokes the
 * session when a refresh token is reused.
 *
 * @returns The client object.
 */
export function createAPIClient(): APIClient {
	let refreshPromise: Promise<void> | null = null;
	const sessionExpiredCallbacks = new Set<() => void>();

	async function runRefresh(): Promise<void> {
		const refresh = async () => {
			const response = await safeFetch(parseURL(REFRESH_ENDPOINT), {
				method: "POST",
				credentials: CREDENTIALS_MODE,
				signal: ensureSignal(),
			});

			if (!response.ok) {
				throw await parseError(response);
			}
		};

		try {
			if (typeof navigator !== "undefined" && navigator.locks) {
				await navigator.locks.request(REFRESH_LOCK_NAME, refresh);
			} else {
				await refresh();
			}
		} catch (err) {
			// Only a rejection from the API means the session is gone; a network
			// failure may be transient.
			if (err instanceof APIError && err.status > 0) {
				sessionExpiredCallbacks.forEach((callback) => callback());
			}
			throw err;
		}
	}

	/** Shares one in-flight refresh between all callers. */
	function refreshSession(): Promise<void> {
		refreshPromise ??= runRefresh().finally(() => {
			refreshPromise = null;
		});
		return refreshPromise;
	}

	async function send<T>(
		method: string,
		endpoint: string,
		{ data, params, signal }: SendOptions,
		replayed = false,
	): Promise<APIResponseBody<T>> {
		const hasBody = method !== "GET" && method !== "DELETE";
		const response = await safeFetch(parseURL(endpoint, params), {
			method,
			headers: hasBody ? { "Content-Type": "application/json" } : undefined,
			body: hasBody ? JSON.stringify(data) : undefined,
			credentials: CREDENTIALS_MODE,
			signal: ensureSignal(signal),
		});

		try {
			return await parseResponse<T>(response);
		} catch (err) {
			const shouldRefresh =
				!replayed &&
				err instanceof APIError &&
				err.status === 401 &&
				err.key === UNAUTHORIZED_KEY &&
				new URL(parseURL(endpoint)).pathname !== REFRESH_ENDPOINT;

			if (!shouldRefresh) {
				throw err;
			}

			try {
				await refreshSession();
			} catch {
				// The caller gets the original 401; refresh failures are reported
				// through onSessionExpired.
				throw err;
			}

			return send<T>(method, endpoint, { data, params, signal }, true);
		}
	}

	return {
		post: (endpoint, { data, signal } = {}) =>
			send("POST", endpoint, { data, signal }),
		get: (endpoint, { params, signal } = {}) =>
			send("GET", endpoint, { params, signal }),
		patch: (endpoint, { data, signal } = {}) =>
			send("PATCH", endpoint, { data, signal }),
		put: (endpoint, { data, signal } = {}) =>
			send("PUT", endpoint, { data, signal }),
		delete: (endpoint, { params, signal } = {}) =>
			send("DELETE", endpoint, { params, signal }),
		onSessionExpired: (callback) => {
			sessionExpiredCallbacks.add(callback);
			return () => {
				sessionExpiredCallbacks.delete(callback);
			};
		},
	};
}
