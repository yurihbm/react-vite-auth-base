import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useTheme } from "@src/modules/shared/hooks/use-theme";

import { ThemeToggle } from ".";

vi.mock("@src/modules/shared/hooks/use-theme", async () => ({
	...(await vi.importActual("@src/modules/shared/hooks/use-theme")),
	useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
	const toggleThemeMock = vi.fn();

	beforeEach(() => {
		toggleThemeMock.mockClear();
		vi.mocked(useTheme).mockReturnValue({
			theme: "dark",
			setTheme: vi.fn(),
			toggleTheme: toggleThemeMock,
		});
	});

	afterEach(() => {
		cleanup();
	});

	test("renders the icon for the current theme", () => {
		const { getByRole } = render(<ThemeToggle />);

		const button = getByRole("button");

		expect(button.innerHTML).toBe(renderToStaticMarkup(<MoonIcon size={18} />));
		expect(button.getAttribute("aria-label")).toBe("Switch to light theme");
	});

	test("renders the icon for the light theme", () => {
		vi.mocked(useTheme).mockReturnValue({
			theme: "light",
			setTheme: vi.fn(),
			toggleTheme: toggleThemeMock,
		});

		const { getByRole } = render(<ThemeToggle />);

		const button = getByRole("button");

		expect(button.innerHTML).toBe(renderToStaticMarkup(<SunIcon size={18} />));
		expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");
	});

	test("calls toggleTheme when clicked", () => {
		const { getByRole } = render(<ThemeToggle />);

		fireEvent.click(getByRole("button"));

		expect(toggleThemeMock).toHaveBeenCalledTimes(1);
	});

	test("applies custom classes", () => {
		const { getByRole } = render(
			<ThemeToggle classNames={{ toggleButton: "text-info" }} />,
		);

		expect(getByRole("button").className).toContain("text-info");
	});
});
