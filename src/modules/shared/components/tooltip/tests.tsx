import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Tooltip } from ".";

describe("Tooltip", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<Tooltip content="Save file">
				<button>Save</button>
			</Tooltip>,
		);

		expect(container).toMatchSnapshot();
	});

	test("tooltip is hidden by default", () => {
		const { queryByRole } = render(
			<Tooltip content="Save file">
				<button>Save</button>
			</Tooltip>,
		);

		expect(queryByRole("tooltip")).toBeNull();
	});

	test("tooltip is visible on mouseenter", () => {
		const { getByRole, getByText } = render(
			<Tooltip content="Save file">
				<button>Save</button>
			</Tooltip>,
		);

		fireEvent.mouseEnter(getByText("Save").parentElement!);

		expect(getByRole("tooltip").textContent).toBe("Save file");
	});

	test("tooltip is hidden on mouseleave", () => {
		const { getByText, queryByRole } = render(
			<Tooltip content="Save file">
				<button>Save</button>
			</Tooltip>,
		);

		const wrapper = getByText("Save").parentElement!;

		fireEvent.mouseEnter(wrapper);
		fireEvent.mouseLeave(wrapper);

		expect(queryByRole("tooltip")).toBeNull();
	});

	test("tooltip is visible on focus", () => {
		const { getByRole, getByText } = render(
			<Tooltip content="Help text">
				<button>Action</button>
			</Tooltip>,
		);

		fireEvent.focus(getByText("Action").parentElement!);

		expect(getByRole("tooltip").textContent).toBe("Help text");
	});

	test("tooltip is hidden on blur", () => {
		const { getByText, queryByRole } = render(
			<Tooltip content="Help text">
				<button>Action</button>
			</Tooltip>,
		);

		const wrapper = getByText("Action").parentElement!;

		fireEvent.focus(wrapper);
		fireEvent.blur(wrapper);

		expect(queryByRole("tooltip")).toBeNull();
	});

	test("trigger has aria-describedby pointing to the tooltip id", () => {
		const { getByText, getByRole } = render(
			<Tooltip content="Description">
				<button>Trigger</button>
			</Tooltip>,
		);

		fireEvent.mouseEnter(getByText("Trigger").parentElement!);

		const tooltip = getByRole("tooltip");
		const trigger = getByText("Trigger");

		expect(trigger.getAttribute("aria-describedby")).toBe(
			tooltip.getAttribute("id"),
		);
	});

	test("preserves existing aria-describedby when tooltip becomes visible", () => {
		const { getByText, getByRole } = render(
			<Tooltip content="Tooltip text">
				<button aria-describedby="help-text">Action</button>
			</Tooltip>,
		);

		fireEvent.mouseEnter(getByText("Action").parentElement!);

		const tooltip = getByRole("tooltip");
		const trigger = getByText("Action");
		const describedBy = trigger.getAttribute("aria-describedby") ?? "";

		expect(describedBy).toContain("help-text");
		expect(describedBy).toContain(tooltip.getAttribute("id"));
	});

	test("restores existing aria-describedby when tooltip becomes hidden", () => {
		const { getByText } = render(
			<Tooltip content="Tooltip text">
				<button aria-describedby="help-text">Action</button>
			</Tooltip>,
		);

		const wrapper = getByText("Action").parentElement!;

		fireEvent.mouseEnter(wrapper);
		fireEvent.mouseLeave(wrapper);

		expect(getByText("Action").getAttribute("aria-describedby")).toBe(
			"help-text",
		);
	});
});
