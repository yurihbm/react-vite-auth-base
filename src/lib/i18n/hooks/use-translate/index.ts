import type { DEFAULT_NAMESPACE } from "../../constants";
import type { Namespace, TranslateFunction } from "../../types";

import { useTranslation } from "react-i18next";

/**
 * A custom hook to access the translation function.
 *
 * @param namespace - The namespace to use for translations.
 * If not provided, the default namespace will be used.
 * @returns The translation function that can be used to translate keys into
 * the current language.
 */
export function useTranslate<N extends Namespace = typeof DEFAULT_NAMESPACE>(
	namespace?: N,
) {
	const { t: translate } = useTranslation(namespace);

	return translate as TranslateFunction<N>;
}
