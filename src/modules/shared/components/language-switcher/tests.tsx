import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { SUPPORTED_LANGUAGE_EMOJI_MAP, useLanguage } from "@src/lib/i18n";

import { LanguageSwitcher } from ".";

vi.mock("@src/lib/i18n", async () => ({
	...(await vi.importActual("@src/lib/i18n")),
	useLanguage: vi.fn(),
}));

describe("LanguageSwitcher", () => {
	const changeLanguageMock = vi.fn();

	beforeEach(() => {
		changeLanguageMock.mockClear();
		vi.mocked(useLanguage).mockReturnValue({
			changeLanguage: changeLanguageMock,
			language: "en",
		} as unknown as ReturnType<typeof useLanguage>);
	});

	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container, getByText } = render(<LanguageSwitcher />);

		expect(container).toMatchSnapshot();
		Object.values(SUPPORTED_LANGUAGE_EMOJI_MAP).forEach((emoji) => {
			expect(getByText(emoji)).toBeDefined();
		});
	});

	test("disables the active language button", () => {
		const { getAllByRole, rerender } = render(<LanguageSwitcher />);

		let [englishButton, portugueseButton] = getAllByRole("button");

		expect((englishButton as HTMLButtonElement).disabled).toBe(true);
		expect((portugueseButton as HTMLButtonElement).disabled).toBe(false);

		vi.mocked(useLanguage).mockReturnValue({
			changeLanguage: changeLanguageMock,
			language: "pt",
		} as unknown as ReturnType<typeof useLanguage>);

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

		const buttons = getAllByRole("button");

		expect(container.firstElementChild?.className).toContain("bg-danger");
		buttons.forEach((button) => {
			expect(button.className).toContain("text-info");
		});
	});
});
