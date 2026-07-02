import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Popover } from ".";
import { Button } from "../button";

describe("Popover", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly (closed)", () => {
		function TestPopover() {
			return (
				<Popover>
					<Popover.Trigger asChild>
						<Button>Open</Button>
					</Popover.Trigger>
					<Popover.Content>Popover content</Popover.Content>
				</Popover>
			);
		}

		const { container } = render(<TestPopover />);

		expect(container).toMatchSnapshot();
	});

	test("content is hidden by default", () => {
		const { queryByText } = render(
			<Popover>
				<Popover.Trigger asChild>
					<Button>Open</Button>
				</Popover.Trigger>
				<Popover.Content>Popover content</Popover.Content>
			</Popover>,
		);

		expect(queryByText("Popover content")).toBeNull();
	});

	test("content opens when trigger is clicked", () => {
		const { getByText } = render(
			<Popover>
				<Popover.Trigger asChild>
					<Button>Open</Button>
				</Popover.Trigger>
				<Popover.Content>Popover content</Popover.Content>
			</Popover>,
		);

		fireEvent.click(getByText("Open"));

		expect(getByText("Popover content")).toBeTruthy();
	});

	test("closes when clicking outside", () => {
		const { getByText, queryByText } = render(
			<div>
				<Popover>
					<Popover.Trigger asChild>
						<Button>Open</Button>
					</Popover.Trigger>
					<Popover.Content>Popover content</Popover.Content>
				</Popover>
				<div data-testid="outside">Outside</div>
			</div>,
		);

		fireEvent.click(getByText("Open"));
		expect(queryByText("Popover content")).toBeTruthy();

		fireEvent.pointerDown(getByText("Outside"));
		expect(queryByText("Popover content")).toBeNull();
	});

	test("closes on Escape key", () => {
		const { getByText, queryByText } = render(
			<Popover>
				<Popover.Trigger asChild>
					<Button>Open</Button>
				</Popover.Trigger>
				<Popover.Content>Popover content</Popover.Content>
			</Popover>,
		);

		fireEvent.click(getByText("Open"));
		expect(queryByText("Popover content")).toBeTruthy();

		fireEvent.keyDown(getByText("Popover content"), { key: "Escape" });
		expect(queryByText("Popover content")).toBeNull();
	});

	test("trigger has aria-haspopup=dialog and aria-expanded", () => {
		const { getByText } = render(
			<Popover>
				<Popover.Trigger asChild>
					<Button>Open</Button>
				</Popover.Trigger>
				<Popover.Content>Popover content</Popover.Content>
			</Popover>,
		);

		const trigger = getByText("Open");

		expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		fireEvent.click(trigger);

		expect(trigger.getAttribute("aria-expanded")).toBe("true");
	});

	test("asChild composes trigger onClick — original handler still fires", () => {
		const originalOnClick = vi.fn();

		const { getByText } = render(
			<Popover>
				<Popover.Trigger asChild>
					<Button onClick={originalOnClick}>Open</Button>
				</Popover.Trigger>
				<Popover.Content>Popover content</Popover.Content>
			</Popover>,
		);

		fireEvent.click(getByText("Open"));

		expect(originalOnClick).toHaveBeenCalledTimes(1);
	});

	test("asChild merges trigger ref — consumer ref is populated", () => {
		const consumerRef = createRef<HTMLButtonElement>();

		render(
			<Popover>
				<Popover.Trigger asChild>
					<Button ref={consumerRef}>Open</Button>
				</Popover.Trigger>
				<Popover.Content>Popover content</Popover.Content>
			</Popover>,
		);

		expect(consumerRef.current).not.toBeNull();
		expect(consumerRef.current?.tagName).toBe("BUTTON");
	});

	test("Trigger without asChild renders a default button", () => {
		const { getByRole } = render(
			<Popover>
				<Popover.Trigger>Open</Popover.Trigger>
				<Popover.Content>Popover content</Popover.Content>
			</Popover>,
		);

		const trigger = getByRole("button", { name: "Open" });

		expect(trigger.tagName).toBe("BUTTON");
		expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
	});

	describe("viewport clamping", () => {
		const VIEWPORT_WIDTH = 400;
		const VIEWPORT_HEIGHT = 600;

		beforeEach(() => {
			Object.defineProperty(window, "innerWidth", {
				value: VIEWPORT_WIDTH,
				writable: true,
				configurable: true,
			});
			Object.defineProperty(window, "innerHeight", {
				value: VIEWPORT_HEIGHT,
				writable: true,
				configurable: true,
			});
		});

		afterEach(() => {
			Object.defineProperty(window, "innerWidth", {
				value: 1024,
				writable: true,
				configurable: true,
			});
			Object.defineProperty(window, "innerHeight", {
				value: 768,
				writable: true,
				configurable: true,
			});
		});

		test("clamps content left when trigger is near the right viewport edge", () => {
			const { getByRole, getByText } = render(
				<Popover>
					<Popover.Trigger asChild>
						<Button>Open</Button>
					</Popover.Trigger>
					<Popover.Content>Popover content</Popover.Content>
				</Popover>,
			);

			const trigger = getByRole("button", { name: "Open" });

			vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
				left: 350,
				right: 400,
				bottom: 50,
				top: 30,
				width: 50,
				height: 20,
				x: 350,
				y: 30,
				toJSON: () => ({}),
			} as DOMRect);

			fireEvent.click(trigger);

			const contentLeft = parseFloat(getByText("Popover content").style.left);

			expect(contentLeft).toBeLessThan(350);
			expect(contentLeft).toBeGreaterThanOrEqual(8);
		});
	});
});
