/**
 * APIResponseMeta is an interface representing the metadata included in the
 * response body of the API.
 */
export interface APIResponseMeta {
	/**
	 * The total number of items available, if the response is paginated.
	 */
	total?: number;
	/**
	 * The number of items included in the current response, if the response is paginated.
	 */
	limit?: number;
	/**
	 * The offset of the first item of the next page of results, if the response is paginated.
	 */
	nextCursor?: string;
}

/**
 * APIResponseBody is a generic interface representing the structure of the
 * response body of the API.
 *
 * @see {@link https://github.com/yurihbm/go-net-http-auth-base/blob/main/internal/api/response.go} for
 * the original Go struct definition.
 */
export interface APIResponseBody<T = unknown> {
	/**
	 * The data returned from the API.
	 *
	 * It will be undefined if status code is 204 (No Content).
	 */
	data: T;
	/**
	 * A message providing additional information about the response, such as
	 * success or error details.
	 */
	message: string;
	/**
	 * Metadata about the response, such as pagination information.
	 */
	meta?: APIResponseMeta;
	/**
	 * An optional error message included in the response if the API request failed.
	 */
	error?: string;
	/**
	 * An optional object containing additional details about the error, such as
	 * validation messages or error codes.
	 */
	details?: Record<string, string>;
}

/**
 * RequestParams is a type representing the query parameters for a GET or DELETE request.
 */
export type RequestParams = Record<string, string | number>;

/**
 * APIClient is an interface representing the methods available for making
 * API requests.
 */
export interface APIClient {
	post: <Body, ResponseData>(
		endpoint: string,
		options?: {
			data?: Body;
			signal?: AbortSignal;
		},
	) => Promise<APIResponseBody<ResponseData>>;
	get: <ResponseData>(
		endpoint: string,
		options?: {
			params?: RequestParams;
			signal?: AbortSignal;
		},
	) => Promise<APIResponseBody<ResponseData>>;
	patch: <Body, ResponseData>(
		endpoint: string,
		options?: {
			data?: Body;
			signal?: AbortSignal;
		},
	) => Promise<APIResponseBody<ResponseData>>;
	put: <Body, ResponseData>(
		endpoint: string,
		options?: {
			data?: Body;
			signal?: AbortSignal;
		},
	) => Promise<APIResponseBody<ResponseData>>;
	delete: <ResponseData>(
		endpoint: string,
		options?: {
			params?: RequestParams;
			signal?: AbortSignal;
		},
	) => Promise<APIResponseBody<ResponseData>>;
}
