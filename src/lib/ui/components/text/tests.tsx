import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Text } from ".";

describe("Text", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Text>Content</Text>);

		expect(container).toMatchSnapshot();
	});

	test("renders a paragraph with the body variant by default", () => {
		const { getByText } = render(<Text>Content</Text>);

		const element = getByText("Content");

		expect(element.tagName).toBe("P");
		expect(element.className).toContain("text-base");
		expect(element.className).toContain("text-foreground");
	});

	test.each([
		["muted", "text-foreground-muted"],
		["caption", "text-xs"],
		["label", "font-medium"],
	] as const)("applies the %s variant", (variant, className) => {
		const { getByText } = render(<Text variant={variant}>Content</Text>);

		expect(getByText("Content").className).toContain(className);
	});

	test("renders a custom element via the as prop and merges className", () => {
		const { getByText } = render(
			<Text as="label" className="custom" htmlFor="field" variant="label">
				Name
			</Text>,
		);

		const element = getByText("Name");

		expect(element.tagName).toBe("LABEL");
		expect(element.getAttribute("for")).toBe("field");
		expect(element.className).toContain("custom");
	});
});
