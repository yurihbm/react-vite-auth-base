import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { InlineError } from ".";

describe("InlineError", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<InlineError>Could not load the user.</InlineError>,
		);

		expect(container).toMatchSnapshot();
	});

	test("announces the message as an alert", () => {
		const { getByRole } = render(
			<InlineError>Could not load the user.</InlineError>,
		);

		const alert = getByRole("alert");

		expect(alert.textContent).toBe("Could not load the user.");
		expect(alert.className).toContain("text-danger");
	});

	test("hides the icon from assistive technology and merges className", () => {
		const { getByRole } = render(
			<InlineError className="custom" id="error">
				Something went wrong.
			</InlineError>,
		);

		const alert = getByRole("alert");

		expect(alert.className).toContain("custom");
		expect(alert.id).toBe("error");
		expect(alert.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
			"true",
		);
	});
});
