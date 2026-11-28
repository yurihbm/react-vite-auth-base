import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Badge } from ".";

describe("Badge", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Badge>New</Badge>);

		expect(container).toMatchSnapshot();
	});

	test("renders as a span by default with default variant classes", () => {
		const { getByText } = render(<Badge>Default</Badge>);

		const badge = getByText("Default");

		expect(badge.tagName).toBe("SPAN");
		expect(badge.className).toContain("rounded-full");
		expect(badge.className).toContain("bg-subtle");
		expect(badge.className).toContain("text-subtle-foreground");
	});

	test("applies color and size variants and merges custom className", () => {
		const { getByText } = render(
			<Badge className="custom-badge" color="danger" size="sm">
				Error
			</Badge>,
		);

		const badge = getByText("Error");

		expect(badge.className).toContain("custom-badge");
		expect(badge.className).toContain("text-xs");
		expect(badge.className).toContain("bg-danger-subtle");
		expect(badge.className).toContain("text-danger-subtle-foreground");
	});

	test("renders with a custom element via as prop", () => {
		const { getByRole } = render(
			<Badge as="a" href="/tags/new">
				Link badge
			</Badge>,
		);

		const link = getByRole("link", { name: "Link badge" });

		expect(link.tagName).toBe("A");
		expect(link.getAttribute("href")).toBe("/tags/new");
	});
});
