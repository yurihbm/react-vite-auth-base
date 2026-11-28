import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { usePopover } from ".";

function keyEvent(key: string) {
	return {
		key,
		preventDefault: vi.fn(),
	} as unknown as ReactKeyboardEvent<HTMLElement>;
}

function setup(params: Parameters<typeof usePopover>[0] = {}) {
	const trigger = document.createElement("button");
	const content = document.createElement("div");
	content.tabIndex = -1;
	document.body.append(trigger, content);

	const hook = renderHook(() => usePopover(params));
	hook.result.current.triggerRef.current = trigger;
	hook.result.current.contentRef.current = content;

	return { ...hook, trigger, content };
}

describe("usePopover", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	test("toggle opens, then closes and restores focus to the trigger", () => {
		const { result, trigger } = setup();

		act(() => result.current.toggle());
		expect(result.current.open).toBe(true);

		act(() => result.current.toggle());

		expect(result.current.open).toBe(false);
		expect(document.activeElement).toBe(trigger);
	});

	test("moves focus into the content when it opens", () => {
		const { result, content } = setup();

		act(() => result.current.toggle());

		expect(document.activeElement).toBe(content);
	});

	test("ArrowDown, Enter and Space on the trigger open it", () => {
		for (const key of ["ArrowDown", "Enter", " "]) {
			const { result } = setup();
			const event = keyEvent(key);

			act(() => result.current.handleTriggerKeyDown(event));

			expect(result.current.open).toBe(true);
			expect(event.preventDefault).toHaveBeenCalled();
		}
	});

	test("Escape on the trigger closes an open popover", () => {
		const { result } = setup();

		act(() => result.current.toggle());
		act(() => result.current.handleTriggerKeyDown(keyEvent("Escape")));

		expect(result.current.open).toBe(false);
	});

	test("ignores unrelated keys on the trigger", () => {
		const { result } = setup();
		const event = keyEvent("a");

		act(() => result.current.handleTriggerKeyDown(event));

		expect(result.current.open).toBe(false);
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	test("Escape inside the content closes it and refocuses the trigger", () => {
		const { result, trigger } = setup();

		act(() => result.current.toggle());
		act(() => result.current.handleContentKeyDown(keyEvent("Escape")));

		expect(result.current.open).toBe(false);
		expect(document.activeElement).toBe(trigger);
	});

	test("other keys inside the content keep it open", () => {
		const { result } = setup();

		act(() => result.current.toggle());
		act(() => result.current.handleContentKeyDown(keyEvent("a")));

		expect(result.current.open).toBe(true);
	});

	test("closes on a pointerdown outside, but not inside trigger or content", () => {
		const { result, trigger, content } = setup();

		act(() => result.current.toggle());
		act(() => {
			trigger.dispatchEvent(new Event("pointerdown", { bubbles: true }));
			content.dispatchEvent(new Event("pointerdown", { bubbles: true }));
		});
		expect(result.current.open).toBe(true);

		act(() => {
			document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
		});
		expect(result.current.open).toBe(false);
	});

	test("controlled mode reports changes without owning the state", () => {
		const onOpenChange = vi.fn();
		const { result } = setup({ open: false, onOpenChange });

		act(() => result.current.toggle());

		expect(onOpenChange).toHaveBeenCalledWith(true);
		expect(result.current.open).toBe(false);
	});

	test("controlled open follows the prop and closing notifies the parent", () => {
		const onOpenChange = vi.fn();
		const { result } = setup({ open: true, onOpenChange });

		act(() => result.current.toggle());

		expect(result.current.open).toBe(true);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
