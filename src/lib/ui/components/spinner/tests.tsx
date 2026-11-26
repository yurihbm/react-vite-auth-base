import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Spinner } from ".";

describe("Spinner", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Spinner />);

		expect(container).toMatchSnapshot();
	});

	test("exposes a status role with a default accessible label", () => {
		const { getByRole } = render(<Spinner />);

		const spinner = getByRole("status");

		expect(spinner.getAttribute("aria-label")).toBe("Loading");
	});

	test("uses a custom label", () => {
		const { getByRole } = render(<Spinner label="Fetching data" />);

		expect(getByRole("status").getAttribute("aria-label")).toBe(
			"Fetching data",
		);
	});

	test("applies size, color, and custom className to the indicator", () => {
		const { getByRole } = render(
			<Spinner className="custom-spinner" color="danger" size="lg" />,
		);

		const indicator = getByRole("status").firstElementChild;

		expect(indicator?.className).toContain("custom-spinner");
		expect(indicator?.className).toContain("size-9");
		expect(indicator?.className).toContain("text-danger");
		expect(indicator?.className).toContain("animate-spin");
	});
});
