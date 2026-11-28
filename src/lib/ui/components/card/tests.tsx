import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Card } from ".";

describe("Card", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Card>Content</Card>);

		expect(container).toMatchSnapshot();
	});

	test("renders children", () => {
		const { getByText } = render(<Card>Card body content</Card>);

		expect(getByText("Card body content")).toBeTruthy();
	});

	test("renders a header when provided", () => {
		const { getByText } = render(<Card header="Card title">Body</Card>);

		expect(getByText("Card title")).toBeTruthy();
	});

	test("does not render a header by default", () => {
		const { queryByText } = render(<Card>Body</Card>);

		expect(queryByText("Card title")).toBeNull();
	});

	test("renders a footer when provided", () => {
		const { getByText } = render(<Card footer="Card footer">Body</Card>);

		expect(getByText("Card footer")).toBeTruthy();
	});

	test("does not render a footer by default", () => {
		const { container } = render(<Card>Body</Card>);

		expect(container.querySelector(".footer")).toBeNull();
	});

	test.each(["none", "sm", "md", "lg"] as const)(
		"renders the %s padding variant",
		(padding) => {
			const { container } = render(<Card padding={padding}>Body</Card>);

			expect(container.firstElementChild).toBeTruthy();
		},
	);

	test("applies classNames overrides to slots", () => {
		const { container, getByText } = render(
			<Card
				header="Title"
				footer="Footer"
				classNames={{
					root: "custom-root",
					header: "custom-header",
					body: "custom-body",
					footer: "custom-footer",
				}}
			>
				Body
			</Card>,
		);

		expect((container.firstElementChild as HTMLElement).className).toContain(
			"custom-root",
		);
		expect(getByText("Title").className).toContain("custom-header");
		expect(getByText("Body").className).toContain("custom-body");
		expect(getByText("Footer").className).toContain("custom-footer");
	});

	test("merges a custom className into the root slot", () => {
		const { container } = render(<Card className="extra">Body</Card>);

		expect((container.firstElementChild as HTMLElement).className).toContain(
			"extra",
		);
	});
});
