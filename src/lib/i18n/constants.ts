/** Default namespace used for translations. */
export const DEFAULT_NAMESPACE = "shared" as const;

/** List of supported languages in the application. */
export const SUPPORTED_LANGUAGES = ["en", "pt"] as const;

/**
 * Language code to emoji mapping for displaying flags or language indicators in
 * the UI.
 */
export const SUPPORTED_LANGUAGE_EMOJI_MAP: Record<
	(typeof SUPPORTED_LANGUAGES)[number],
	string
> = {
	en: "🇺🇸",
	pt: "🇧🇷",
};

/**
 * Each language's name in that language (e.g. for a language switcher, where
 * people look for their own language).
 */
export const SUPPORTED_LANGUAGE_NAME_MAP: Record<
	(typeof SUPPORTED_LANGUAGES)[number],
	string
> = {
	en: "English",
	pt: "Português",
};

/**
 * Fallback language to use when the user's preferred language is not supported
 * or when a translation key is missing in the current language.
 */
export const FALLBACK_LANGUAGE = "en" as const;
