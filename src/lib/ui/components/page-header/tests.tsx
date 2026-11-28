import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { PageHeader } from ".";

describe("PageHeader", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<PageHeader description="Manage your profile." title="Account" />,
		);

		expect(container).toMatchSnapshot();
	});

	test("renders the title as the page's h1", () => {
		const { getAllByRole, getByRole } = render(<PageHeader title="Account" />);

		expect(getByRole("heading", { level: 1, name: "Account" })).toBeTruthy();
		expect(getAllByRole("heading")).toHaveLength(1);
	});

	test("renders the description, back link and actions when given", () => {
		const { getByRole, getByText } = render(
			<PageHeader
				actions={<button type="button">Edit</button>}
				backLink={<a href="/account">Back to account</a>}
				description="Manage your password and sessions."
				title="Security"
			/>,
		);

		expect(getByText("Manage your password and sessions.")).toBeTruthy();
		expect(getByRole("link", { name: "Back to account" })).toBeTruthy();
		expect(getByRole("button", { name: "Edit" })).toBeTruthy();
	});

	test("omits the optional parts when not given", () => {
		const { container } = render(<PageHeader title="Account" />);

		expect(container.querySelector("p")).toBeNull();
		expect(container.querySelector("a")).toBeNull();
	});

	test("merges custom className on the header element", () => {
		const { container } = render(
			<PageHeader className="custom" title="Account" />,
		);

		const header = container.querySelector("header");

		expect(header?.className).toContain("custom");
	});
});
