import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { SUPPORTED_LANGUAGE_EMOJI_MAP, useLanguage } from "@lib/i18n";

import { LanguageSwitcher } from ".";

vi.mock("@lib/i18n", async () => ({
	...(await vi.importActual("@lib/i18n")),
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

	test("names each language in its own language and marks the active one", () => {
		const { getByRole, rerender } = render(<LanguageSwitcher />);

		const group = getByRole("group", { name: "languageSwitcher.label" });
		const english = getByRole("button", { name: "English" });
		const portuguese = getByRole("button", { name: "Português" });

		expect(group).toBeTruthy();
		expect(english.getAttribute("lang")).toBe("en");
		expect(portuguese.getAttribute("lang")).toBe("pt");
		expect(english.getAttribute("aria-pressed")).toBe("true");
		expect(portuguese.getAttribute("aria-pressed")).toBe("false");
		expect((english as HTMLButtonElement).disabled).toBe(false);

		vi.mocked(useLanguage).mockReturnValue({
			changeLanguage: changeLanguageMock,
			language: "pt",
		} as unknown as ReturnType<typeof useLanguage>);
		rerender(<LanguageSwitcher />);

		expect(
			getByRole("button", { name: "Português" }).getAttribute("aria-pressed"),
		).toBe("true");
	});

	test("does not switch to the language already in use", () => {
		const { getByRole } = render(<LanguageSwitcher />);

		fireEvent.click(getByRole("button", { name: "English" }));

		expect(changeLanguageMock).not.toHaveBeenCalled();
	});

	test("gives each button a 44px target", () => {
		const { getByRole } = render(<LanguageSwitcher />);

		expect(getByRole("button", { name: "English" }).className).toContain(
			"size-11",
		);
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
