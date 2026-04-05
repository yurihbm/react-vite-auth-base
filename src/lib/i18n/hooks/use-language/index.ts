import type { SupportedLanguage } from "../../types";

import { useTranslation } from "react-i18next";

import { FALLBACK_LANGUAGE } from "../../constants";

/**
 * A custom hook to access the current language and change it.
 */
export function useLanguage() {
	const { i18n } = useTranslation();

	async function changeLanguage(language: SupportedLanguage) {
		await i18n.changeLanguage(language);
	}

	return {
		language: (i18n.resolvedLanguage ?? FALLBACK_LANGUAGE) as SupportedLanguage,
		changeLanguage,
	};
}
