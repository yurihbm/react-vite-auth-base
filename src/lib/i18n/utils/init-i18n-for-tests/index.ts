import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_NAMESPACE, FALLBACK_LANGUAGE } from "@lib/i18n/constants";

/**
 * Initializes a minimal, synchronous i18n instance for tests.
 *
 * Renders that call `useTranslation`/`useTranslate` need an initialized
 * instance to avoid the `NO_I18NEXT_INSTANCE` warning. There are no resources
 * loaded, so `nsSeparator` is disabled to keep missing-key fallbacks equal to
 * the raw translation key (e.g. `"home:validation.amount.required"`), matching
 * what tests assert on.
 */
export function initI18nForTests() {
	void i18next.use(initReactI18next).init({
		lng: FALLBACK_LANGUAGE,
		fallbackLng: FALLBACK_LANGUAGE,
		defaultNS: DEFAULT_NAMESPACE,
		resources: {},
		interpolation: { escapeValue: false },
		nsSeparator: false,
	});
}
