import type { LanguageSwitcherStyles } from "./styles";

import { useTranslation } from "react-i18next";

import { base, switchButton } from "./styles";

interface LanguageSwitcherProps {
	classNames?: LanguageSwitcherStyles;
}

/**
 * A simple language switcher component that allows users to switch between
 * English and Portuguese.
 */
export function LanguageSwitcher({ classNames = {} }: LanguageSwitcherProps) {
	const { i18n } = useTranslation();

	return (
		<div className={base({ className: classNames.base })}>
			<button
				className={switchButton({ className: classNames.switchButton })}
				disabled={i18n.resolvedLanguage === "en"}
				onClick={() => i18n.changeLanguage("en")}
			>
				🇺🇸
			</button>
			<button
				className={switchButton({ className: classNames.switchButton })}
				disabled={i18n.resolvedLanguage === "pt"}
				onClick={() => i18n.changeLanguage("pt")}
			>
				🇧🇷
			</button>
		</div>
	);
}
