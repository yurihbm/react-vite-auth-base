import type { HttpBackendOptions } from "i18next-http-backend";

import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import {
	DEFAULT_NAMESPACE,
	FALLBACK_LANGUAGE,
	SUPPORTED_LANGUAGES,
} from "../../constants";

/**
 * Initializes the i18n instance with the necessary plugins and configuration.
 *
 * Call it at the application entry point (e.g., main.tsx).
 */
export async function initI18n() {
	await i18next
		.use(HttpBackend)
		.use(LanguageDetector)
		.use(initReactI18next)
		.init<HttpBackendOptions>({
			debug: import.meta.env.DEV,
			fallbackLng: FALLBACK_LANGUAGE,
			defaultNS: DEFAULT_NAMESPACE,
			supportedLngs: SUPPORTED_LANGUAGES,
			ns: [DEFAULT_NAMESPACE],
			backend: {
				loadPath: "/locales/{{lng}}/{{ns}}.json",
			},
		});
}
