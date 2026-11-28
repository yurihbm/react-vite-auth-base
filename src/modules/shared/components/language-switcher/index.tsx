import type { LanguageSwitcherStyles } from "./styles";

import {
	SUPPORTED_LANGUAGE_EMOJI_MAP,
	SUPPORTED_LANGUAGE_NAME_MAP,
	SUPPORTED_LANGUAGES,
	useLanguage,
	useTranslate,
} from "@lib/i18n";

import { base, switchButton } from "./styles";

interface LanguageSwitcherProps {
	classNames?: LanguageSwitcherStyles;
}

/**
 * A simple language switcher component that allows users to switch between
 * English and Portuguese. Each button is named in its own language, and the
 * active one is marked with `aria-pressed`.
 */
export function LanguageSwitcher({ classNames = {} }: LanguageSwitcherProps) {
	const t = useTranslate();
	const { language, changeLanguage } = useLanguage();

	return (
		<div
			role="group"
			aria-label={t("languageSwitcher.label")}
			className={base({ className: classNames.base })}
		>
			{SUPPORTED_LANGUAGES.map((lang) => (
				<button
					key={lang}
					type="button"
					lang={lang}
					aria-label={SUPPORTED_LANGUAGE_NAME_MAP[lang]}
					aria-pressed={language === lang}
					className={switchButton({ className: classNames.switchButton })}
					onClick={() => {
						if (language !== lang) {
							changeLanguage(lang);
						}
					}}
				>
					<span aria-hidden="true">{SUPPORTED_LANGUAGE_EMOJI_MAP[lang]}</span>
				</button>
			))}
		</div>
	);
}
