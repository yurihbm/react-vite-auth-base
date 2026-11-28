import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Divider } from ".";

describe("Divider", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Divider />);

		expect(container).toMatchSnapshot();
	});

	test("renders a separator without a label", () => {
		const { getByRole } = render(<Divider className="custom" />);

		const separator = getByRole("separator");

		expect(separator.tagName).toBe("HR");
		expect(separator.className).toContain("border-border");
		expect(separator.className).toContain("custom");
	});

	test("renders a readable label between two decorative lines", () => {
		const { container, getByText, queryByRole } = render(
			<Divider label="or" />,
		);

		expect(getByText("or")).toBeTruthy();
		expect(queryByRole("separator")).toBeNull();
		expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(2);
	});
});
