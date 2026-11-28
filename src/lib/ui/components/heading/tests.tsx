import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Heading } from ".";

describe("Heading", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Heading>Title</Heading>);

		expect(container).toMatchSnapshot();
	});

	test("renders an h2 by default", () => {
		const { getByRole } = render(<Heading>Title</Heading>);

		const heading = getByRole("heading", { level: 2, name: "Title" });

		expect(heading.tagName).toBe("H2");
	});

	test.each([
		[1, "text-3xl"],
		[2, "text-2xl"],
		[3, "text-xl"],
		[4, "text-lg"],
	] as const)("renders level %i with its default size", (level, size) => {
		const { getByRole } = render(<Heading level={level}>Title</Heading>);

		const heading = getByRole("heading", { level, name: "Title" });

		expect(heading.className).toContain(size);
	});

	test("keeps the level when the size is overridden", () => {
		const { getByRole } = render(
			<Heading className="custom" level={1} size="sm">
				Title
			</Heading>,
		);

		const heading = getByRole("heading", { level: 1, name: "Title" });

		expect(heading.className).toContain("text-lg");
		expect(heading.className).not.toContain("text-3xl");
		expect(heading.className).toContain("custom");
	});

	test("renders a custom element via the as prop", () => {
		const { getByText } = render(
			<Heading as="legend" level={3}>
				Title
			</Heading>,
		);

		const element = getByText("Title");

		expect(element.tagName).toBe("LEGEND");
		expect(element.className).toContain("text-xl");
	});

	test("has an xs size for headings inside dense content", () => {
		const { getByRole } = render(
			<Heading level={3} size="xs">
				Title
			</Heading>,
		);

		expect(getByRole("heading", { level: 3 }).className).toContain("text-base");
	});
});
