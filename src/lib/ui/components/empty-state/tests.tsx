import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { EmptyState } from ".";

describe("EmptyState", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<EmptyState description="Try another search." title="No users found" />,
		);

		expect(container).toMatchSnapshot();
	});

	test("renders the title and description", () => {
		const { getByText } = render(
			<EmptyState description="Try another search." title="No users found" />,
		);

		expect(getByText("No users found")).toBeTruthy();
		expect(getByText("Try another search.")).toBeTruthy();
	});

	test("renders the action and a decorative icon when given", () => {
		const { container, getByRole } = render(
			<EmptyState
				action={<button type="button">Clear filters</button>}
				icon={<svg data-testid="icon" />}
				title="No users found"
			/>,
		);

		expect(getByRole("button", { name: "Clear filters" })).toBeTruthy();

		const icon = container.querySelector("[data-testid='icon']");

		expect(icon?.parentElement?.getAttribute("aria-hidden")).toBe("true");
	});

	test("omits the optional parts and merges custom className", () => {
		const { container } = render(
			<EmptyState className="custom" title="Nothing here" />,
		);

		const root = container.firstElementChild;

		expect(root?.className).toContain("custom");
		expect(root?.querySelector("[aria-hidden='true']")).toBeNull();
		expect(root?.childElementCount).toBe(1);
	});
});
