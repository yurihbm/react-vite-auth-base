import { cleanup, fireEvent, render } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { LanguageSwitcher } from ".";

vi.mock("react-i18next", () => ({
	useTranslation: vi.fn(),
}));

describe("LanguageSwitcher", () => {
	const changeLanguageMock = vi.fn();

	beforeEach(() => {
		changeLanguageMock.mockClear();
		vi.mocked(useTranslation).mockReturnValue({
			i18n: {
				changeLanguage: changeLanguageMock,
				resolvedLanguage: "en",
			},
		} as unknown as ReturnType<typeof useTranslation>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container, getByText } = render(<LanguageSwitcher />);

		expect(container).toMatchSnapshot();
		expect(getByText("🇺🇸")).toBeDefined();
		expect(getByText("🇧🇷")).toBeDefined();
	});

	test("disables the active language button", () => {
		const { getAllByRole, rerender } = render(<LanguageSwitcher />);

		let [englishButton, portugueseButton] = getAllByRole("button");

		expect((englishButton as HTMLButtonElement).disabled).toBe(true);
		expect((portugueseButton as HTMLButtonElement).disabled).toBe(false);

		vi.mocked(useTranslation).mockReturnValue({
			i18n: {
				changeLanguage: changeLanguageMock,
				resolvedLanguage: "pt",
			},
		} as unknown as ReturnType<typeof useTranslation>);

		rerender(<LanguageSwitcher />);
		[englishButton, portugueseButton] = getAllByRole("button");

		expect((englishButton as HTMLButtonElement).disabled).toBe(false);
		expect((portugueseButton as HTMLButtonElement).disabled).toBe(true);
	});

	test("changes language when clicking an inactive button", () => {
		const { getAllByRole } = render(<LanguageSwitcher />);

		const [, portugueseButton] = getAllByRole("button");

		fireEvent.click(portugueseButton);

		expect(changeLanguageMock).toHaveBeenCalledTimes(1);
		expect(changeLanguageMock).toHaveBeenCalledWith("pt");
	});

	test("applies custom classes", () => {
		const { container, getAllByRole } = render(
			<LanguageSwitcher
				classNames={{
					base: "bg-danger",
					switchButton: "text-info",
				}}
			/>,
		);

		const [englishButton, portugueseButton] = getAllByRole("button");

		expect(container.firstElementChild?.className).toContain("bg-danger");
		expect(englishButton.className).toContain("text-info");
		expect(portugueseButton.className).toContain("text-info");
	});
});
