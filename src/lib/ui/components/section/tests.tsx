import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Section } from ".";

describe("Section", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<Section description="Your public details." title="Profile">
				Content
			</Section>,
		);

		expect(container).toMatchSnapshot();
	});

	test("renders a region labelled by its h2 title", () => {
		const { getByRole } = render(<Section title="Profile">Content</Section>);

		const region = getByRole("region", { name: "Profile" });

		expect(region.tagName).toBe("SECTION");
		expect(getByRole("heading", { level: 2, name: "Profile" })).toBeTruthy();
		expect(region.textContent).toContain("Content");
	});

	test("renders the description when given", () => {
		const { getByText } = render(
			<Section description="Your public details." title="Profile">
				Content
			</Section>,
		);

		expect(getByText("Your public details.")).toBeTruthy();
	});

	test("has no surface by default and a card surface when requested", () => {
		const { getByRole, rerender } = render(
			<Section title="Profile">Content</Section>,
		);

		expect(getByRole("region").className).not.toContain("border");

		rerender(
			<Section className="custom" surface title="Profile">
				Content
			</Section>,
		);

		const region = getByRole("region");

		expect(region.className).toContain("rounded-surface");
		expect(region.className).toContain("border-border");
		expect(region.className).toContain("bg-background-elevated");
		expect(region.className).toContain("custom");
	});
});
