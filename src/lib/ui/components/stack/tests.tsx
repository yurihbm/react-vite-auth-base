import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Stack } from ".";

describe("Stack", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Stack>Content</Stack>);

		expect(container).toMatchSnapshot();
	});

	test("lays out children in a column with the default gap", () => {
		const { getByText } = render(<Stack>Content</Stack>);

		const element = getByText("Content");

		expect(element.className).toContain("flex-col");
		expect(element.className).toContain("gap-4");
	});

	test.each([
		["none", "gap-0"],
		["xs", "gap-1"],
		["sm", "gap-2"],
		["lg", "gap-6"],
		["xl", "gap-8"],
	] as const)("applies the %s gap", (gap, className) => {
		const { getByText } = render(<Stack gap={gap}>Content</Stack>);

		expect(getByText("Content").className).toContain(className);
	});

	test("renders a custom element via the as prop and merges className", () => {
		const { getByRole } = render(
			<Stack as="ul" className="custom">
				<li>Item</li>
			</Stack>,
		);

		const list = getByRole("list");

		expect(list.className).toContain("custom");
	});
});
