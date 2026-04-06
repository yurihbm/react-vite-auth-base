import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useTranslate } from ".";

vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

describe("useTranslate", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("returns the translation function from react-i18next", () => {
		const translateMock = vi.fn();

		vi.mocked(useTranslation).mockReturnValue({
			t: translateMock,
		} as unknown as ReturnType<typeof useTranslation>);

		const { result } = renderHook(() => useTranslate("shared"));

		expect(useTranslation).toHaveBeenCalledTimes(1);
		expect(useTranslation).toHaveBeenCalledWith("shared");
		expect(result.current).toBe(translateMock);
	});

	test("uses default namespace when none is provided", () => {
		const translateMock = vi.fn();

		vi.mocked(useTranslation).mockReturnValue({
			t: translateMock,
		} as unknown as ReturnType<typeof useTranslation>);

		const { result } = renderHook(() => useTranslate());

		expect(useTranslation).toHaveBeenCalledTimes(1);
		expect(useTranslation).toHaveBeenCalledWith(undefined);
		expect(result.current).toBe(translateMock);
	});
});
