import { afterEach, describe, expect, test, vi } from "vitest";

import { computeFloatingPosition } from ".";

function makeTrigger(rect: Partial<DOMRect>): HTMLElement {
	const element = document.createElement("button");
	vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
		x: 0,
		y: 0,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		toJSON: () => {},
		...rect,
	});
	return element;
}

function makeContent(width: number, height: number): HTMLElement {
	const element = document.createElement("div");
	Object.defineProperty(element, "offsetWidth", { value: width });
	Object.defineProperty(element, "offsetHeight", { value: height });
	return element;
}

describe("computeFloatingPosition", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("anchors below the trigger when there is enough space", () => {
		vi.stubGlobal("innerWidth", 1024);
		vi.stubGlobal("innerHeight", 768);

		const trigger = makeTrigger({
			top: 100,
			bottom: 130,
			left: 20,
			width: 200,
		});
		const style = computeFloatingPosition(trigger, makeContent(200, 150));

		expect(style).toMatchObject({ position: "fixed", top: 134, left: 20 });
		expect(style.bottom).toBeUndefined();
	});

	test("flips above the trigger when there is more room above than below", () => {
		vi.stubGlobal("innerWidth", 1024);
		vi.stubGlobal("innerHeight", 400);

		const trigger = makeTrigger({
			top: 350,
			bottom: 380,
			left: 20,
			width: 200,
		});
		const style = computeFloatingPosition(trigger, makeContent(200, 100));

		expect(style).toMatchObject({ position: "fixed", bottom: 54, left: 20 });
		expect(style.top).toBeUndefined();
	});

	test("clamps left so the content stays inside the viewport", () => {
		vi.stubGlobal("innerWidth", 320);
		vi.stubGlobal("innerHeight", 768);

		const trigger = makeTrigger({ top: 10, bottom: 40, left: 280, width: 40 });
		const style = computeFloatingPosition(trigger, makeContent(240, 100));

		expect(style.left).toBe(320 - 240 - 8);
	});

	test("matches the trigger width and skips horizontal clamping when matchTriggerWidth is set", () => {
		vi.stubGlobal("innerWidth", 320);
		vi.stubGlobal("innerHeight", 768);

		const trigger = makeTrigger({ top: 10, bottom: 40, left: 280, width: 200 });
		const style = computeFloatingPosition(trigger, null, {
			matchTriggerWidth: true,
		});

		expect(style).toMatchObject({ left: 280, width: 200 });
		expect(style.maxWidth).toBeUndefined();
	});

	test("uses the fallback width to estimate position before content renders", () => {
		vi.stubGlobal("innerWidth", 1024);
		vi.stubGlobal("innerHeight", 768);

		const trigger = makeTrigger({ top: 10, bottom: 40, left: 900, width: 40 });
		const style = computeFloatingPosition(trigger, null, {
			fallbackWidth: 300,
		});

		expect(style.left).toBe(1024 - 300 - 8);
	});
});
