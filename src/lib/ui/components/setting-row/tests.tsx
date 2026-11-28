import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { SettingRow } from ".";

describe("SettingRow", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<SettingRow description="Sign out everywhere else." title="Sessions">
				<button type="button">Sign out</button>
			</SettingRow>,
		);

		expect(container).toMatchSnapshot();
	});

	test("renders the title as an h3 with its description and the action", () => {
		render(
			<SettingRow description="Sign out everywhere else." title="Sessions">
				<button type="button">Sign out</button>
			</SettingRow>,
		);

		const heading = screen.getByRole("heading", { level: 3, name: "Sessions" });

		expect(heading.className).toContain("text-base");
		expect(screen.getByText("Sign out everywhere else.")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
	});

	test("stacks on small screens and puts the action on the right from md", () => {
		const { container } = render(
			<SettingRow className="custom" title="Sessions">
				<button type="button">Sign out</button>
			</SettingRow>,
		);

		const root = container.firstElementChild as HTMLElement;

		expect(root.className).toContain("flex-col");
		expect(root.className).toContain("md:flex-row");
		expect(root.className).toContain("custom");
		expect(container.querySelector("p")).toBeNull();
	});
});
