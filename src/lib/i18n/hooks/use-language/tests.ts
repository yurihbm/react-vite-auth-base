import type { SupportedLanguage } from "../../types";

import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useLanguage } from ".";
import { FALLBACK_LANGUAGE } from "../../constants";

vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

describe("useLanguage", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(useTranslation).mockReturnValue({
			i18n: {
				resolvedLanguage: "en",
				changeLanguage: vi.fn().mockResolvedValue(undefined),
			},
		} as unknown as ReturnType<typeof useTranslation>);
	});

	test("returns the current resolved language", () => {
		const { result } = renderHook(() => useLanguage());

		expect(result.current.language).toBe("en");
	});

	test("falls back to default language when resolved language is missing", () => {
		vi.mocked(useTranslation).mockReturnValueOnce({
			i18n: {
				resolvedLanguage: undefined,
				changeLanguage: vi.fn().mockResolvedValue(undefined),
			},
		} as unknown as ReturnType<typeof useTranslation>);

		const { result } = renderHook(() => useLanguage());

		expect(result.current.language).toBe(FALLBACK_LANGUAGE);
	});

	test("calls i18n.changeLanguage with the selected language", async () => {
		const changeLanguageMock = vi.fn().mockResolvedValue(undefined);

		vi.mocked(useTranslation).mockReturnValueOnce({
			i18n: {
				resolvedLanguage: "en",
				changeLanguage: changeLanguageMock,
			},
		} as unknown as ReturnType<typeof useTranslation>);

		const { result } = renderHook(() => useLanguage());

		await result.current.changeLanguage("pt" as SupportedLanguage);

		expect(changeLanguageMock).toHaveBeenCalledTimes(1);
		expect(changeLanguageMock).toHaveBeenCalledWith("pt");
	});
});
