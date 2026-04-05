import type { TFunction } from "i18next";
import type Resources from "./generated/resources";

import { DEFAULT_NAMESPACE, SUPPORTED_LANGUAGES } from "./constants";

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type Namespace = keyof Resources;
export type TranslateFunction<N extends Namespace = typeof DEFAULT_NAMESPACE> =
	TFunction<N>;
