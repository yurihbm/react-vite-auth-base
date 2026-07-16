import type { ThemeToggleStyles } from "./styles";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { useTheme } from "@src/modules/shared/hooks/use-theme";

import { toggleButton } from "./styles";

export interface ThemeToggleProps {
	classNames?: ThemeToggleStyles;
}

const ICON_SIZE = 18;

const THEME_ICON_MAP = {
	light: <SunIcon size={ICON_SIZE} />,
	dark: <MoonIcon size={ICON_SIZE} />,
};

/**
 * A simple toggle button that switches the application between the light and
 * dark color themes.
 */
export function ThemeToggle({ classNames = {} }: ThemeToggleProps) {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			className={toggleButton({ className: classNames.toggleButton })}
			onClick={toggleTheme}
			aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
		>
			{THEME_ICON_MAP[theme]}
		</button>
	);
}
