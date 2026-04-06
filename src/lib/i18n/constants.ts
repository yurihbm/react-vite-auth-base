/**
 * Default namespace used for translations.
 */
export const DEFAULT_NAMESPACE = "shared" as const;

/**
 * List of supported languages in the application.
 */
export const SUPPORTED_LANGUAGES = ["en", "pt"] as const;

/**
 * Language code to emoji mapping for displaying flags or language indicators
 * in the UI.
 */
export const SUPPORTED_LANGUAGE_EMOJI_MAP: Record<
	(typeof SUPPORTED_LANGUAGES)[number],
	string
> = {
	en: "🇺🇸",
	pt: "🇧🇷",
};

/**
 * Fallback language to use when the user's preferred language is not supported
 * or when a translation key is missing in the current language.
 */
export const FALLBACK_LANGUAGE = "en" as const;
