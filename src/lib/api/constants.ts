/**
 * Error message to be used when an API request fails without a specific error
 * message.
 */
export const DEFAULT_ERROR_MESSAGE =
	"An error occurred while processing the request.";

/**
 * Default timeout for API requests, in milliseconds. This is used when no
 * AbortSignal is provided, to ensure that requests do not hang indefinitely.
 */
export const DEFAULT_TIMEOUT = 5000; // 5 seconds

/**
 * The credentials mode to be used for API requests.
 */
export const CREDENTIALS_MODE: RequestCredentials = "include";

/**
 * Message to be used when the API returns a successful response with no
 * content.
 */
export const EMPTY_RESPONSE_MESSAGE = "The API returned no content.";
