import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Portal } from ".";

describe("Portal", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders children into document.body by default", () => {
		const { container } = render(
			<Portal>
				<span data-testid="portal-child">Hello</span>
			</Portal>,
		);

		const child = document.body.querySelector('[data-testid="portal-child"]');

		expect(child?.textContent).toBe("Hello");
		// Children are not rendered inside the component's own container.
		expect(container.querySelector('[data-testid="portal-child"]')).toBeNull();
	});

	test("renders children into a custom container", () => {
		const target = document.createElement("div");
		document.body.appendChild(target);

		render(
			<Portal container={target}>
				<span data-testid="custom-child">In target</span>
			</Portal>,
		);

		expect(target.querySelector('[data-testid="custom-child"]')).not.toBeNull();

		document.body.removeChild(target);
	});
});
