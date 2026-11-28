import type { ParseKeys, ParseKeysWithoutVariables, TFunction } from "i18next";
import type Resources from "./generated/resources";

import { DEFAULT_NAMESPACE, SUPPORTED_LANGUAGES } from "./constants";

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type Namespace = keyof Resources;
export type TranslateKey<N extends Namespace = typeof DEFAULT_NAMESPACE> =
	ParseKeys<N>;
/** A key `t()` accepts without options (its string has no variables). */
export type TranslateKeyWithoutVariables<
	N extends Namespace = typeof DEFAULT_NAMESPACE,
> = ParseKeysWithoutVariables<N>;
export type TranslateFunction<N extends Namespace = typeof DEFAULT_NAMESPACE> =
	TFunction<N>;
