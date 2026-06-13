import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Skeleton } from ".";

describe("Skeleton", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Skeleton />);

		expect(container).toMatchSnapshot();
	});

	test("is hidden from assistive technology and pulses by default", () => {
		const { container } = render(<Skeleton />);

		const skeleton = container.firstElementChild;

		expect(skeleton?.getAttribute("aria-hidden")).toBe("true");
		expect(skeleton?.className).toContain("animate-pulse");
		expect(skeleton?.className).toContain("h-4");
	});

	test("applies variant and merges custom className", () => {
		const { container } = render(
			<Skeleton variant="circle" className="size-10" />,
		);

		const skeleton = container.firstElementChild;

		expect(skeleton?.className).toContain("rounded-full");
		expect(skeleton?.className).toContain("size-10");
	});
});
