import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
}

function getStoredTheme(): Theme | null {
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === "light" || stored === "dark" ? stored : null;
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.remove("light", "dark");
	root.classList.add(theme);
}

export interface UseThemeResult {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

/**
 * A custom hook to read and update the current color theme, persisting the
 * preference to `localStorage` and falling back to the OS-level preference when
 * none has been chosen yet.
 */
export function useTheme(): UseThemeResult {
	const [theme, setThemeState] = useState<Theme>(
		() => getStoredTheme() ?? getSystemTheme(),
	);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const setTheme = useCallback((next: Theme) => {
		localStorage.setItem(STORAGE_KEY, next);
		setThemeState(next);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === "light" ? "dark" : "light");
	}, [setTheme, theme]);

	return { theme, setTheme, toggleTheme };
}
