import type { HttpBackendOptions } from "i18next-http-backend";

import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const defaultNS = "shared" as const;

i18next
	.use(HttpBackend)
	.use(LanguageDetector)
	.use(initReactI18next)
	.init<HttpBackendOptions>({
		debug: import.meta.env.DEV,
		supportedLngs: ["en", "pt"],
		fallbackLng: "en",
		defaultNS,
		ns: [defaultNS],
		backend: {
			loadPath: "/locales/{{lng}}/{{ns}}.json",
		},
	});
