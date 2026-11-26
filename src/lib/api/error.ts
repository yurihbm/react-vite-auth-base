/** Options accepted by the {@link APIError} constructor. */
export interface APIErrorOptions {
	/** The HTTP status code of the response. `0` when there was no response. */
	status?: number;
	/**
	 * The message key identifying the error, such as `auth.unauthorized`.
	 * Defaults to the error message.
	 */
	key?: string;
	/** An object containing additional details about the error. */
	details?: Record<string, string>;
	/** Seconds to wait before retrying, parsed from the `Retry-After` header. */
	retryAfter?: number;
}

/**
 * APIError is a custom error class that extends the built-in Error class.
 *
 * Its `key` is a dot-separated message key (backend keys such as
 * `auth.unauthorized`, or `client.*` / `http.<status>` fallbacks) that can be
 * translated with the `errors` i18n namespace.
 */
export class APIError extends Error {
	/** The HTTP status code of the response. `0` when there was no response. */
	public status: number;
	/** The message key identifying the error. */
	public key: string;
	/** An optional object containing additional details about the error. */
	public details?: Record<string, string>;
	/** Seconds to wait before retrying, when the API sent `Retry-After`. */
	public retryAfter?: number;

	constructor(message: string, options: APIErrorOptions = {}) {
		super(message);
		this.name = "APIError";
		this.status = options.status ?? 0;
		this.key = options.key ?? message;
		this.details = options.details;
		this.retryAfter = options.retryAfter;
	}
}
