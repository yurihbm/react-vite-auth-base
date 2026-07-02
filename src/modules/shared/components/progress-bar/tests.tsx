import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { ProgressBar } from ".";

describe("ProgressBar", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<ProgressBar value={50} />);

		expect(container).toMatchSnapshot();
	});

	test("exposes a progressbar role", () => {
		const { getByRole } = render(<ProgressBar value={50} />);

		expect(getByRole("progressbar")).toBeTruthy();
	});

	test("sets aria-valuenow/min/max based on value and max", () => {
		const { getByRole } = render(<ProgressBar value={30} max={50} />);

		const progressbar = getByRole("progressbar");

		expect(progressbar.getAttribute("aria-valuenow")).toBe("30");
		expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
		expect(progressbar.getAttribute("aria-valuemax")).toBe("50");
	});

	test("clamps value to the [0, max] range", () => {
		const { getByRole, rerender } = render(<ProgressBar value={150} />);

		expect(getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");

		rerender(<ProgressBar value={-10} />);

		expect(getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
	});

	test("omits aria-valuenow when indeterminate", () => {
		const { getByRole } = render(<ProgressBar indeterminate />);

		expect(getByRole("progressbar").hasAttribute("aria-valuenow")).toBe(false);
	});

	test("renders a label when provided", () => {
		const { getByText } = render(<ProgressBar value={40} label="Uploading" />);

		expect(getByText("Uploading")).toBeTruthy();
	});

	test("shows the numeric percentage when showValue is true", () => {
		const { getByText } = render(<ProgressBar value={40} showValue />);

		expect(getByText("40%")).toBeTruthy();
	});

	test.each(["primary", "success", "warning", "danger"] as const)(
		"renders the %s color variant",
		(color) => {
			const { getByRole } = render(<ProgressBar value={50} color={color} />);

			expect(getByRole("progressbar")).toBeTruthy();
		},
	);
});
