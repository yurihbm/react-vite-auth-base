import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
	DEFAULT_NAMESPACE,
	FALLBACK_LANGUAGE,
	SUPPORTED_LANGUAGES,
} from "@lib/i18n/constants";

import { initI18n } from ".";

vi.mock("i18next", () => {
	const i18nextInstance = {
		use: vi.fn(),
		init: vi.fn().mockResolvedValue(undefined),
		on: vi.fn(),
		resolvedLanguage: "pt",
	};

	i18nextInstance.use.mockReturnValue(i18nextInstance);

	return {
		default: i18nextInstance,
	};
});

vi.mock("i18next-http-backend", () => ({
	default: "http-backend-plugin",
}));

vi.mock("i18next-browser-languagedetector", () => ({
	default: "language-detector-plugin",
}));

vi.mock("react-i18next", () => ({
	initReactI18next: "react-i18next-plugin",
}));

describe("initI18n", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("registers i18n plugins in the expected order", async () => {
		await initI18n();

		expect(i18next.use).toHaveBeenCalledTimes(3);
		expect(i18next.use).toHaveBeenNthCalledWith(1, HttpBackend);
		expect(i18next.use).toHaveBeenNthCalledWith(2, LanguageDetector);
		expect(i18next.use).toHaveBeenNthCalledWith(3, initReactI18next);
	});

	test("initializes i18next with project defaults", async () => {
		await initI18n();

		expect(i18next.init).toHaveBeenCalledTimes(1);
		expect(i18next.init).toHaveBeenCalledWith({
			debug: import.meta.env.DEV && import.meta.env.MODE !== "test",
			fallbackLng: FALLBACK_LANGUAGE,
			defaultNS: DEFAULT_NAMESPACE,
			supportedLngs: SUPPORTED_LANGUAGES,
			ns: [DEFAULT_NAMESPACE],
			backend: {
				loadPath: "/locales/{{lng}}/{{ns}}.json",
			},
		});
	});

	test("syncs the html lang attribute on init and language change", async () => {
		document.documentElement.lang = "en";

		await initI18n();

		expect(document.documentElement.lang).toBe("pt");

		const [event, onLanguageChanged] = vi.mocked(i18next.on).mock.calls[0];
		expect(event).toBe("languageChanged");

		Object.assign(i18next, { resolvedLanguage: "en" });
		(onLanguageChanged as () => void)();

		expect(document.documentElement.lang).toBe("en");
	});
});
