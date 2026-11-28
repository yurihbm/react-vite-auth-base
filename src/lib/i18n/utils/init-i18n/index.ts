import type { HttpBackendOptions } from "i18next-http-backend";

import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import {
	DEFAULT_NAMESPACE,
	FALLBACK_LANGUAGE,
	SUPPORTED_LANGUAGES,
} from "@lib/i18n/constants";

/**
 * Initializes the i18n instance with the necessary plugins and configuration.
 *
 * Call it at the application entry point (e.g., main.tsx). Keeps the `<html
 * lang>` attribute in sync with the resolved language.
 */
export async function initI18n() {
	i18next.on("languageChanged", syncDocumentLanguage);

	await i18next
		.use(HttpBackend)
		.use(LanguageDetector)
		.use(initReactI18next)
		.init<HttpBackendOptions>({
			debug: import.meta.env.DEV && import.meta.env.MODE !== "test",
			fallbackLng: FALLBACK_LANGUAGE,
			defaultNS: DEFAULT_NAMESPACE,
			supportedLngs: SUPPORTED_LANGUAGES,
			ns: [DEFAULT_NAMESPACE],
			backend: {
				loadPath: "/locales/{{lng}}/{{ns}}.json",
			},
		});

	syncDocumentLanguage();
}

function syncDocumentLanguage() {
	document.documentElement.lang = i18next.resolvedLanguage ?? FALLBACK_LANGUAGE;
}
