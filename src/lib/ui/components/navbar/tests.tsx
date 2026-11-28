import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Navbar } from ".";

function renderNavbar() {
	return render(
		<Navbar
			actions={<button type="button">Account menu</button>}
			brand={<a href="/">Brand</a>}
			menuLabel="Menu"
			navLabel="Main"
		>
			<a href="/">Home</a>
			<a href="/users">Users</a>
		</Navbar>,
	);
}

function getToggle() {
	return screen.getByRole("button", { name: "Menu" });
}

describe("Navbar", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = renderNavbar();

		expect(container).toMatchSnapshot();
	});

	test("renders the brand as a link, not a heading, and the actions", () => {
		renderNavbar();

		expect(screen.getByRole("link", { name: "Brand" })).toBeTruthy();
		expect(screen.queryByRole("heading")).toBeNull();
		expect(screen.getByRole("button", { name: "Account menu" })).toBeTruthy();
	});

	test("renders the links in a labelled navigation landmark", () => {
		renderNavbar();

		const nav = screen.getByRole("navigation", { name: "Main" });

		expect(nav.textContent).toContain("Home");
		expect(nav.className).toContain("md:flex");
	});

	test("collapses the menu behind a toggle that controls it", () => {
		renderNavbar();

		const toggle = getToggle();

		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		expect(toggle.className).toContain("md:hidden");

		fireEvent.click(toggle);

		const panelId = toggle.getAttribute("aria-controls") as string;
		const panel = document.getElementById(panelId);

		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		expect(panel?.textContent).toContain("Users");
	});

	test("closes the menu on Escape and returns focus to the toggle", () => {
		renderNavbar();

		const toggle = getToggle();

		fireEvent.click(toggle);
		fireEvent.keyDown(document, { key: "Escape" });

		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(toggle);
	});

	test("closes the menu when a link inside it is followed", () => {
		renderNavbar();

		const toggle = getToggle();

		fireEvent.click(toggle);

		const panel = document.getElementById(
			toggle.getAttribute("aria-controls") as string,
		) as HTMLElement;

		fireEvent.click(panel.querySelector("a[href='/users']") as HTMLElement);

		expect(toggle.getAttribute("aria-expanded")).toBe("false");
	});

	test("gives the menu toggle a 44px target", () => {
		renderNavbar();

		expect(getToggle().className).toContain("size-11");
	});
});
