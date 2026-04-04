/**
 * APIError is a custom error class that extends the built-in Error class.
 *
 * It includes an optional `details` property that can hold additional
 * information about the error, such as validation messages or error codes.
 */
export class APIError extends Error {
	/**
	 * An optional object containing additional details about the error.
	 */
	public details?: Record<string, string>;

	constructor(message: string, details?: Record<string, string>) {
		super(message);
		this.name = "APIError";
		this.details = details;
	}
}
