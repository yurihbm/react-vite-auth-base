import type { TranslateKey } from "@lib/i18n";

import { useTranslate } from "@lib/i18n";

import { APIError } from "../../error";

/**
 * Resolves the user-facing message of an error from the `errors` namespace.
 *
 * Uses the error's own key when translated, then its `http.<status>` fallback,
 * then `client.unknown` for anything that is not an `APIError`.
 *
 * @param error - The error thrown by an API call.
 * @returns The translated message.
 */
export function useApiErrorMessage(error: unknown): string {
	const translate = useTranslate("errors");

	const unknown = translate("client.unknown");

	if (!(error instanceof APIError)) {
		return unknown;
	}

	const fallback = translate(`http.${error.status}` as TranslateKey<"errors">, {
		defaultValue: unknown,
	});

	return translate(error.key as TranslateKey<"errors">, {
		defaultValue: fallback,
	});
}
