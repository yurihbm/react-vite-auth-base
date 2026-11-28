import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useTheme } from ".";

function mockMatchMedia(prefersLight: boolean) {
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockImplementation((query: string) => ({
			matches: query === "(prefers-color-scheme: light)" && prefersLight,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		})),
	);
}

describe("useTheme", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.classList.remove("light", "dark");
		mockMatchMedia(false);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("falls back to the system theme when nothing is stored", () => {
		mockMatchMedia(true);

		const { result } = renderHook(() => useTheme());

		expect(result.current.theme).toBe("light");
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});

	test("prefers the stored theme over the system theme", () => {
		localStorage.setItem("theme", "light");
		mockMatchMedia(false);

		const { result } = renderHook(() => useTheme());

		expect(result.current.theme).toBe("light");
	});

	test("setTheme updates state, class, and storage", () => {
		const { result } = renderHook(() => useTheme());

		act(() => {
			result.current.setTheme("light");
		});

		expect(result.current.theme).toBe("light");
		expect(localStorage.getItem("theme")).toBe("light");
		expect(document.documentElement.classList.contains("light")).toBe(true);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	test("toggleTheme flips between light and dark", () => {
		const { result } = renderHook(() => useTheme());
		const initial = result.current.theme;

		act(() => {
			result.current.toggleTheme();
		});

		expect(result.current.theme).toBe(initial === "light" ? "dark" : "light");

		act(() => {
			result.current.toggleTheme();
		});

		expect(result.current.theme).toBe(initial);
	});

	test("matches the browser theme color to the theme", () => {
		const meta = document.createElement("meta");
		meta.name = "theme-color";
		document.head.append(meta);

		const { result } = renderHook(() => useTheme());

		act(() => result.current.setTheme("light"));
		expect(meta.content).toBe("#ffffff");

		act(() => result.current.setTheme("dark"));
		expect(meta.content).toBe("#0a0a0a");

		meta.remove();
	});
});
