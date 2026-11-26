import type { Namespace, TranslateKey } from "@lib/i18n/types";

/**
 * Identity marker used to author translation keys in contexts without access to
 * `useTranslate` (e.g. zod schema `message` fields). Resolve the returned key
 * with `t()` at render time.
 *
 * The key must be namespace-qualified (`"ns:key"`, matching this project's
 * `nsSeparator`). Namespace prefixing isn't optional here: `i18next-cli`'s
 * extractor has no lexical `useTranslate(ns)` scope to infer a namespace from
 * in a schema file, so an unprefixed key would be routed into `defaultNS`
 * regardless of the generic parameter — confirmed empirically against this
 * project's `i18next.config.ts`.
 *
 * Registered as an extraction target in `i18next.config.ts` so `i18next-cli`
 * treats calls to it like `t()` and keeps the keys from being pruned by
 * `removeUnusedKeys`.
 *
 * @see https://github.com/i18next/i18next-cli/issues/239
 */
export function translationKey<N extends Namespace>(
	key: `${N}:${TranslateKey<N>}`,
): string {
	return key;
}
