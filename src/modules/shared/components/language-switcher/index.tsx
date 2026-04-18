import type { LanguageSwitcherStyles } from "./styles";

import {
	SUPPORTED_LANGUAGE_EMOJI_MAP,
	SUPPORTED_LANGUAGES,
	useLanguage,
} from "@src/lib/i18n";

import { base, switchButton } from "./styles";

interface LanguageSwitcherProps {
	classNames?: LanguageSwitcherStyles;
}

/**
 * A simple language switcher component that allows users to switch between
 * English and Portuguese.
 */
export function LanguageSwitcher({ classNames = {} }: LanguageSwitcherProps) {
	const { language, changeLanguage } = useLanguage();

	return (
		<div className={base({ className: classNames.base })}>
			{SUPPORTED_LANGUAGES.map((lang) => (
				<button
					key={lang}
					className={switchButton({ className: classNames.switchButton })}
					disabled={language === lang}
					onClick={() => changeLanguage(lang)}
					aria-label={lang}
				>
					{SUPPORTED_LANGUAGE_EMOJI_MAP[lang]}
				</button>
			))}
		</div>
	);
}
