import { fireEvent, render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Button } from ".";

describe("Button", () => {
	test("renders correctly", () => {
		const { container } = render(<Button>Click me</Button>);

		expect(container).toMatchSnapshot();
	});

	test("renders as button by default with base and default variant classes", () => {
		const { getByRole } = render(<Button>Submit</Button>);

		const button = getByRole("button", { name: "Submit" });

		expect(button.tagName).toBe("BUTTON");
		expect(button.className).toContain("flex");
		expect(button.className).toContain("items-center");
		expect(button.className).toContain("justify-center");
		expect(button.className).toContain("gap-2");
		expect(button.className).toContain("rounded");
		expect(button.className).toContain("text-base");
		expect(button.className).toContain("bg-primary");
		expect(button.className).toContain("text-primary-foreground");
	});

	test("applies variant classes and merges custom className", () => {
		const { getByRole } = render(
			<Button className="custom-button" color="danger" size="lg">
				Delete
			</Button>,
		);

		const button = getByRole("button", { name: "Delete" });

		expect(button.className).toContain("custom-button");
		expect(button.className).toContain("text-lg");
		expect(button.className).toContain("bg-danger");
		expect(button.className).toContain("text-danger-foreground");
	});

	test("renders with a custom element via as prop and forwards element-specific props", () => {
		const { getByRole } = render(
			<Button as="a" href="/account" rel="noreferrer">
				Go to account
			</Button>,
		);

		const link = getByRole("link", { name: "Go to account" });

		expect(link.tagName).toBe("A");
		expect(link.getAttribute("href")).toBe("/account");
		expect(link.getAttribute("rel")).toBe("noreferrer");
	});

	test("forwards common props and handles click when enabled", () => {
		const onClick = vi.fn();

		const { getByRole } = render(
			<Button
				aria-label="Save changes"
				data-track="save"
				id="save-btn"
				onClick={onClick}
			>
				Save
			</Button>,
		);

		const button = getByRole("button", { name: "Save changes" });

		fireEvent.click(button);

		expect(button.getAttribute("id")).toBe("save-btn");
		expect(button.getAttribute("data-track")).toBe("save");
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	test("does not call onClick when disabled", () => {
		const onClick = vi.fn();

		const { getByRole } = render(
			<Button disabled onClick={onClick}>
				Disabled
			</Button>,
		);

		const button = getByRole("button", { name: "Disabled" });

		fireEvent.click(button);

		expect((button as HTMLButtonElement).disabled).toBe(true);
		expect(onClick).not.toHaveBeenCalled();
	});
});
