import type { DEFAULT_NAMESPACE } from "@lib/i18n/constants";
import type { Namespace, TranslateKeyWithoutVariables } from "@lib/i18n/types";

import { useState } from "react";

/**
 * A custom hook that manages the state of a translation key.
 *
 * Used to get valid key parsing from the i18next-cli and to ensure type safety
 * when setting translation keys. Only keys without interpolation variables are
 * accepted, since the stored key is later translated with `t(key)` and no
 * options.
 *
 * @param namespace - The namespace to use for the translation key. If not
 *   provided, the default namespace will be used.
 * @returns An object containing the current translation key and a function to
 *   update it.
 * @see https://github.com/i18next/i18next-cli/issues/239
 */
export function useTranslateKeyState<
	N extends Namespace = typeof DEFAULT_NAMESPACE,
	// namespace variable is used for type inference and i18next-cli parsing.
	// oxlint-disable-next-line no-unused-vars
>(namespace: N = "shared" as N) {
	const [value, setValue] = useState<TranslateKeyWithoutVariables<
		typeof namespace
	> | null>(null);

	/**
	 * Sets the current translation key.
	 *
	 * @param key - The translation key to set. Must be a valid key for the
	 *   specified namespace or null to clear the key.
	 */
	function setKey(key: TranslateKeyWithoutVariables<typeof namespace> | null) {
		setValue(key);
	}

	return {
		setKey,
		/** The current translation key. Can be null if no key is set. */
		key: value,
	};
}
