/**
 * Validates a `redirect` search param so login cannot send users to another
 * origin.
 *
 * @param value - The raw search param value.
 * @returns The value when it is an in-app path, `/` otherwise.
 */
export function safeRedirect(value: unknown): string {
	if (
		typeof value === "string" &&
		value.startsWith("/") &&
		!value.startsWith("//") &&
		!value.startsWith("/\\")
	) {
		return value;
	}

	return "/";
}
