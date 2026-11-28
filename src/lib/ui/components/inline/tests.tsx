import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Inline } from ".";

describe("Inline", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Inline>Content</Inline>);

		expect(container).toMatchSnapshot();
	});

	test("lays out children in a wrapping row with the default gap", () => {
		const { getByText } = render(<Inline>Content</Inline>);

		const element = getByText("Content");

		expect(element.className).toContain("flex-row");
		expect(element.className).toContain("flex-wrap");
		expect(element.className).toContain("items-center");
		expect(element.className).toContain("gap-2");
	});

	test.each([
		["none", "gap-0"],
		["xs", "gap-1"],
		["md", "gap-4"],
		["lg", "gap-6"],
		["xl", "gap-8"],
	] as const)("applies the %s gap", (gap, className) => {
		const { getByText } = render(<Inline gap={gap}>Content</Inline>);

		expect(getByText("Content").className).toContain(className);
	});

	test("renders a custom element via the as prop and merges className", () => {
		const { getByRole } = render(
			<Inline as="ul" className="custom">
				<li>Item</li>
			</Inline>,
		);

		expect(getByRole("list").className).toContain("custom");
	});
});
