import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useDropdownMenu } from ".";

function keyEvent(key: string) {
	return {
		key,
		preventDefault: vi.fn(),
	} as unknown as ReactKeyboardEvent<HTMLElement>;
}

function setup() {
	const trigger = document.createElement("button");
	const menu = document.createElement("div");
	menu.tabIndex = -1;
	const items = ["One", "Two", "Three"].map((label) => {
		const item = document.createElement("button");
		item.setAttribute("role", "menuitem");
		item.textContent = label;
		menu.append(item);
		return item;
	});
	document.body.append(trigger, menu);

	const hook = renderHook(() => useDropdownMenu());
	hook.result.current.triggerRef.current = trigger;
	hook.result.current.menuRef.current = menu;

	return { ...hook, trigger, menu, items };
}

describe("useDropdownMenu", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	test("toggle opens, then closes and restores focus to the trigger", () => {
		const { result, menu, trigger } = setup();

		act(() => result.current.toggle());
		expect(result.current.open).toBe(true);
		expect(document.activeElement).toBe(menu);

		act(() => result.current.toggle());

		expect(result.current.open).toBe(false);
		expect(document.activeElement).toBe(trigger);
	});

	test("closes on a pointerdown outside, but not inside trigger or menu", () => {
		const { result, trigger, items } = setup();

		act(() => result.current.toggle());
		act(() => {
			trigger.dispatchEvent(new Event("pointerdown", { bubbles: true }));
			items[0].dispatchEvent(new Event("pointerdown", { bubbles: true }));
		});
		expect(result.current.open).toBe(true);

		act(() => {
			document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
		});
		expect(result.current.open).toBe(false);
	});

	test("Escape on the trigger closes an open menu", () => {
		const { result } = setup();

		act(() => result.current.toggle());
		act(() => result.current.handleTriggerKeyDown(keyEvent("Escape")));

		expect(result.current.open).toBe(false);
	});

	test("Escape and Tab inside the menu close it and refocus the trigger", () => {
		for (const key of ["Escape", "Tab"]) {
			const { result, trigger } = setup();
			const event = keyEvent(key);

			act(() => result.current.toggle());
			act(() => result.current.handleMenuKeyDown(event));

			expect(result.current.open).toBe(false);
			expect(document.activeElement).toBe(trigger);
			expect(event.preventDefault).toHaveBeenCalled();
		}
	});

	test("ArrowUp from the first item wraps to the last", () => {
		const { result, items } = setup();

		items[0].focus();
		act(() => result.current.handleMenuKeyDown(keyEvent("ArrowUp")));

		expect(document.activeElement).toBe(items[2]);
	});

	test("ArrowDown from the last item wraps to the first", () => {
		const { result, items } = setup();

		items[2].focus();
		act(() => result.current.handleMenuKeyDown(keyEvent("ArrowDown")));

		expect(document.activeElement).toBe(items[0]);
	});

	test("arrow navigation skips aria-disabled items", () => {
		const { result, items } = setup();
		items[1].setAttribute("aria-disabled", "true");

		items[0].focus();
		act(() => result.current.handleMenuKeyDown(keyEvent("ArrowDown")));

		expect(document.activeElement).toBe(items[2]);
	});

	test("menu key handling is a no-op when the menu is not mounted", () => {
		const { result } = setup();
		result.current.menuRef.current = null;
		const event = keyEvent("ArrowDown");

		act(() => result.current.handleMenuKeyDown(event));

		expect(event.preventDefault).not.toHaveBeenCalled();
	});
});
