import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { SkipLink } from ".";

describe("SkipLink", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<SkipLink href="#main-content">Skip to content</SkipLink>,
		);

		expect(container).toMatchSnapshot();
	});

	test("links to the target and stays hidden until focused", () => {
		const { getByRole } = render(
			<SkipLink className="custom" href="#main-content">
				Skip to content
			</SkipLink>,
		);

		const link = getByRole("link", { name: "Skip to content" });

		expect(link.getAttribute("href")).toBe("#main-content");
		expect(link.className).toContain("sr-only");
		expect(link.className).toContain("focus:not-sr-only");
		// not-sr-only resets padding, so the focused state sets it again.
		expect(link.className).toContain("focus:px-4");
		expect(link.className).toContain("custom");
	});
});
