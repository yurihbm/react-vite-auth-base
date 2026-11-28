import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Container } from ".";

describe("Container", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Container>Content</Container>);

		expect(container).toMatchSnapshot();
	});

	test("centers its content with page padding and the default width", () => {
		const { getByText } = render(<Container>Content</Container>);

		const element = getByText("Content");

		expect(element.tagName).toBe("DIV");
		expect(element.className).toContain("mx-auto");
		expect(element.className).toContain("px-4");
		expect(element.className).toContain("max-w-3xl");
	});

	test.each([
		["narrow", "max-w-md"],
		["wide", "max-w-7xl"],
	] as const)("applies the %s size", (size, className) => {
		const { getByText } = render(
			<Container className="custom" size={size}>
				Content
			</Container>,
		);

		const element = getByText("Content");

		expect(element.className).toContain(className);
		expect(element.className).toContain("custom");
	});
});
