import type { AccordionItem } from "./types";

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Accordion } from ".";

const items: AccordionItem[] = [
	{ value: "a", title: "First", content: "First content" },
	{ value: "b", title: "Second", content: "Second content" },
	{ value: "c", title: "Third", content: "Third content", disabled: true },
];

describe("Accordion", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Accordion items={items} />);

		expect(container).toMatchSnapshot();
	});

	test("renders all item titles", () => {
		const { getByText } = render(<Accordion items={items} />);

		expect(getByText("First")).toBeTruthy();
		expect(getByText("Second")).toBeTruthy();
		expect(getByText("Third")).toBeTruthy();
	});

	test("all items are collapsed by default", () => {
		const { queryByText } = render(<Accordion items={items} />);

		expect(queryByText("First content")).toBeNull();
		expect(queryByText("Second content")).toBeNull();
	});

	test("clicking a header toggles its panel visibility", () => {
		const { getByText, queryByText } = render(<Accordion items={items} />);

		fireEvent.click(getByText("First"));
		expect(queryByText("First content")).toBeTruthy();

		fireEvent.click(getByText("First"));
		expect(queryByText("First content")).toBeNull();
	});

	test("single mode closes the previously open item", () => {
		const { getByText, queryByText } = render(
			<Accordion items={items} type="single" />,
		);

		fireEvent.click(getByText("First"));
		expect(queryByText("First content")).toBeTruthy();

		fireEvent.click(getByText("Second"));
		expect(queryByText("First content")).toBeNull();
		expect(queryByText("Second content")).toBeTruthy();
	});

	test("multiple mode keeps other items open", () => {
		const { getByText, queryByText } = render(
			<Accordion items={items} type="multiple" />,
		);

		fireEvent.click(getByText("First"));
		fireEvent.click(getByText("Second"));

		expect(queryByText("First content")).toBeTruthy();
		expect(queryByText("Second content")).toBeTruthy();
	});

	test("disabled items cannot be toggled", () => {
		const { getByText, queryByText } = render(<Accordion items={items} />);

		fireEvent.click(getByText("Third"));
		expect(queryByText("Third content")).toBeNull();
	});

	test("sets aria-expanded, aria-controls, and role=region", () => {
		const { getByText, getByRole } = render(<Accordion items={items} />);

		const header = getByText("First");
		expect(header.getAttribute("aria-expanded")).toBe("false");

		fireEvent.click(header);
		expect(header.getAttribute("aria-expanded")).toBe("true");

		const panelId = header.getAttribute("aria-controls");
		const region = getByRole("region");
		expect(region.id).toBe(panelId);
		expect(region.getAttribute("aria-labelledby")).toBe(header.id);
	});

	test("ArrowDown/ArrowUp/Home/End move focus between headers, skipping disabled", () => {
		const { getByText } = render(<Accordion items={items} />);

		const first = getByText("First");
		const second = getByText("Second");

		first.focus();
		fireEvent.keyDown(first, { key: "ArrowDown" });
		expect(document.activeElement).toBe(second);

		fireEvent.keyDown(second, { key: "ArrowDown" });
		expect(document.activeElement).toBe(first);

		fireEvent.keyDown(first, { key: "ArrowUp" });
		expect(document.activeElement).toBe(second);

		fireEvent.keyDown(second, { key: "End" });
		expect(document.activeElement).toBe(second);

		fireEvent.keyDown(second, { key: "Home" });
		expect(document.activeElement).toBe(first);
	});

	test("supports controlled usage via value/onChange", () => {
		const onChange = vi.fn();
		const { getByText, queryByText } = render(
			<Accordion items={items} value={["a"]} onChange={onChange} />,
		);

		expect(queryByText("First content")).toBeTruthy();

		fireEvent.click(getByText("Second"));
		expect(onChange).toHaveBeenCalledWith(["b"]);
		// Controlled: internal DOM state doesn't change since value prop is fixed.
		expect(queryByText("First content")).toBeTruthy();
	});
});
