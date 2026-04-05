/**
 * Default namespace used for translations.
 */
export const DEFAULT_NAMESPACE = "shared" as const;

/**
 * List of supported languages in the application.
 */
export const SUPPORTED_LANGUAGES = ["en", "pt"] as const;

/**
 * Fallback language to use when the user's preferred language is not supported
 * or when a translation key is missing in the current language.
 */
export const FALLBACK_LANGUAGE = "en" as const;
