import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Breadcrumb } from ".";

afterEach(cleanup);

describe("Breadcrumb", () => {
	test("renders correctly", () => {
		const { container } = render(
			<Breadcrumb
				items={[
					{ label: "Home", href: "/" },
					{ label: "Library", href: "/library" },
					{ label: "Data" },
				]}
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	test("nav has aria-label Breadcrumb", () => {
		const { getByRole } = render(
			<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Data" }]} />,
		);

		expect(getByRole("navigation", { name: "Breadcrumb" })).toBeDefined();
	});

	test("last item is current page and not a link", () => {
		const { getByText } = render(
			<Breadcrumb
				items={[{ label: "Home", href: "/" }, { label: "Current" }]}
			/>,
		);

		const current = getByText("Current");

		expect(current.getAttribute("aria-current")).toBe("page");
		expect(current.tagName).toBe("SPAN");
	});

	test("renders one fewer separators than items", () => {
		const { container } = render(
			<Breadcrumb
				items={[
					{ label: "Home", href: "/" },
					{ label: "Library", href: "/library" },
					{ label: "Data" },
				]}
			/>,
		);

		expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(2);
	});

	test("items with href render as anchors", () => {
		const { getByText } = render(
			<Breadcrumb
				items={[{ label: "Home", href: "/home" }, { label: "Data" }]}
			/>,
		);

		const link = getByText("Home");

		expect(link.tagName).toBe("A");
		expect(link.getAttribute("href")).toBe("/home");
	});

	test("calls onClick when clickable item is clicked", () => {
		const onClick = vi.fn();
		const { getByText } = render(
			<Breadcrumb items={[{ label: "Home", onClick }, { label: "Data" }]} />,
		);

		fireEvent.click(getByText("Home"));

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	test("renders custom separator", () => {
		const { container } = render(
			<Breadcrumb
				separator=">"
				items={[{ label: "Home", href: "/" }, { label: "Data" }]}
			/>,
		);

		const separators = container.querySelectorAll('[aria-hidden="true"]');

		expect(separators.length).toBe(1);
		expect(separators[0].textContent).toBe(">");
	});

	test("single item renders with no separator", () => {
		const { container } = render(<Breadcrumb items={[{ label: "Home" }]} />);

		expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(0);
	});
});
