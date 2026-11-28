import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { NavLink } from ".";

describe("NavLink", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<NavLink href="/">Home</NavLink>);

		expect(container).toMatchSnapshot();
	});

	test("renders a muted link with a 24px+ target", () => {
		const { getByRole } = render(<NavLink href="/">Home</NavLink>);

		const link = getByRole("link", { name: "Home" });

		expect(link.getAttribute("href")).toBe("/");
		expect(link.className).toContain("text-foreground-muted");
		expect(link.className).toContain("h-9");
	});

	test("styles the current page through aria-current", () => {
		const { getByRole } = render(
			<NavLink aria-current="page" href="/account">
				Account
			</NavLink>,
		);

		const link = getByRole("link", { name: "Account" });

		expect(link.getAttribute("aria-current")).toBe("page");
		expect(link.className).toContain("aria-[current=page]:text-foreground");
	});

	test("renders a custom element via the as prop and merges className", () => {
		const { getByRole } = render(
			<NavLink as="button" className="custom" type="button">
				Logout
			</NavLink>,
		);

		const button = getByRole("button", { name: "Logout" });

		expect(button.className).toContain("custom");
	});
});
