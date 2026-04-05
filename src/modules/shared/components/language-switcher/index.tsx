import type { LanguageSwitcherStyles } from "./styles";

import { useLanguage } from "@src/lib/i18n";

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
			<button
				className={switchButton({ className: classNames.switchButton })}
				disabled={language === "en"}
				onClick={() => changeLanguage("en")}
			>
				🇺🇸
			</button>
			<button
				className={switchButton({ className: classNames.switchButton })}
				disabled={language === "pt"}
				onClick={() => changeLanguage("pt")}
			>
				🇧🇷
			</button>
		</div>
	);
}
