import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DropdownMenu } from ".";
import { Button } from "../button";

describe("DropdownMenu", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly (closed)", () => {
		function TestMenu() {
			return (
				<DropdownMenu>
					<DropdownMenu.Trigger asChild>
						<Button>Options</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onSelect={() => {}} color="danger">
						Delete
					</DropdownMenu.Item>
				</DropdownMenu>
			);
		}

		const { container } = render(<TestMenu />);

		expect(container).toMatchSnapshot();
	});

	test("menu is hidden by default", () => {
		const { queryByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		expect(queryByRole("menu")).toBeNull();
	});

	test("menu opens when trigger is clicked", () => {
		const { getByRole, getByText } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		expect(getByRole("menu")).toBeTruthy();
	});

	test("menu has menuitem roles for items", () => {
		const { getByText, getAllByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onSelect={() => {}} color="danger">
					Delete
				</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		expect(getAllByRole("menuitem")).toHaveLength(2);
	});

	test("closes when an item is selected", () => {
		const onEdit = vi.fn();

		const { getByText, queryByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={onEdit}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));
		fireEvent.click(getByText("Edit"));

		expect(onEdit).toHaveBeenCalledTimes(1);
		expect(queryByRole("menu")).toBeNull();
	});

	test("closes on Escape key", () => {
		const { getByText, getByRole, queryByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		expect(getByRole("menu")).toBeTruthy();

		fireEvent.keyDown(getByRole("menu"), { key: "Escape" });

		expect(queryByRole("menu")).toBeNull();
	});

	test("ArrowDown moves focus to the first item when menu opens", () => {
		const { getByText, getByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onSelect={() => {}} color="danger">
					Delete
				</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		const menu = getByRole("menu");

		fireEvent.keyDown(menu, { key: "ArrowDown" });

		expect(document.activeElement?.textContent).toBe("Edit");
	});

	test("ArrowDown moves focus to the next item", () => {
		const { getByText, getByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onSelect={() => {}} color="danger">
					Delete
				</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		const menu = getByRole("menu");

		fireEvent.keyDown(menu, { key: "ArrowDown" });
		fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

		expect(document.activeElement?.textContent).toBe("Delete");
	});

	test("ArrowUp moves focus to the previous item", () => {
		const { getByText, getByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onSelect={() => {}} color="danger">
					Delete
				</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		const menu = getByRole("menu");

		fireEvent.keyDown(menu, { key: "ArrowDown" });
		fireEvent.keyDown(menu, { key: "ArrowDown" });
		fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });

		expect(document.activeElement?.textContent).toBe("Edit");
	});

	test("trigger has aria-haspopup=menu and aria-expanded", () => {
		const { getByText } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		const trigger = getByText("Options");

		expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
		expect(trigger.getAttribute("aria-expanded")).toBe("false");

		fireEvent.click(trigger);

		expect(trigger.getAttribute("aria-expanded")).toBe("true");
	});

	test("trigger does not submit a parent form when clicked", () => {
		const onSubmit = vi.fn((e: { preventDefault: () => void }) =>
			e.preventDefault(),
		);

		const { getByText } = render(
			<form onSubmit={onSubmit}>
				<DropdownMenu>
					<DropdownMenu.Trigger asChild>
						<Button>Options</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				</DropdownMenu>
			</form>,
		);

		fireEvent.click(getByText("Options"));

		expect(onSubmit).not.toHaveBeenCalled();
	});

	test("danger item has color=danger class", () => {
		const { getByText } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onSelect={() => {}} color="danger">
					Delete
				</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		expect(getByText("Delete").className).toContain("text-danger");
	});

	test("asChild composes trigger onClick — original handler still fires", () => {
		const originalOnClick = vi.fn();

		const { getByText } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button onClick={originalOnClick}>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.click(getByText("Options"));

		expect(originalOnClick).toHaveBeenCalledTimes(1);
	});

	test("asChild composes trigger onKeyDown — original handler still fires", () => {
		const originalOnKeyDown = vi.fn();

		const { getByText } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button onKeyDown={originalOnKeyDown}>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		fireEvent.keyDown(getByText("Options"), { key: "ArrowDown" });

		expect(originalOnKeyDown).toHaveBeenCalledTimes(1);
	});

	test("asChild merges trigger ref — consumer ref is populated", () => {
		const consumerRef = createRef<HTMLButtonElement>();

		render(
			<DropdownMenu>
				<DropdownMenu.Trigger asChild>
					<Button ref={consumerRef}>Options</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		expect(consumerRef.current).not.toBeNull();
		expect(consumerRef.current?.tagName).toBe("BUTTON");
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

		test("clamps menu left when trigger is near the right viewport edge", () => {
			const { getByRole, getByText } = render(
				<DropdownMenu>
					<DropdownMenu.Trigger asChild>
						<Button>Options</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				</DropdownMenu>,
			);

			const trigger = getByRole("button", { name: "Options" });

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

			const menuLeft = parseFloat(
				getByText("Edit").closest<HTMLElement>("[role=menu]")!.style.left,
			);

			// With viewport 400px and fallback menu width 160px,
			// clamped left = min(350, 400 - 160 - 8) = min(350, 232) = 232
			expect(menuLeft).toBeLessThan(350);
			expect(menuLeft).toBeGreaterThanOrEqual(8);
		});

		test("menu has maxWidth to prevent overflow on narrow viewports", () => {
			const { getByRole, getByText } = render(
				<DropdownMenu>
					<DropdownMenu.Trigger asChild>
						<Button>Options</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
				</DropdownMenu>,
			);

			fireEvent.click(getByRole("button", { name: "Options" }));

			const menu = getByText("Edit").closest<HTMLElement>("[role=menu]")!;
			const maxWidth = parseFloat(menu.style.maxWidth);

			// maxWidth = viewport - 2 * EDGE_PADDING = 400 - 16 = 384
			expect(maxWidth).toBe(VIEWPORT_WIDTH - 16);
		});
	});

	test("Trigger without asChild renders a default button", () => {
		const { getByRole } = render(
			<DropdownMenu>
				<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
				<DropdownMenu.Item onSelect={() => {}}>Edit</DropdownMenu.Item>
			</DropdownMenu>,
		);

		const trigger = getByRole("button", { name: "Options" });

		expect(trigger.tagName).toBe("BUTTON");
		expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
	});
});
