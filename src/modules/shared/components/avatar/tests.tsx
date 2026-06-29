import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Avatar } from ".";

describe("Avatar", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Avatar name="Ana Lima" />);

		expect(container).toMatchSnapshot();
	});

	test("renders an img when src is given", () => {
		const { getByRole } = render(<Avatar src="/photo.jpg" name="Ana Lima" />);

		expect(getByRole("img").tagName).toBe("IMG");
		expect(getByRole("img").getAttribute("src")).toBe("/photo.jpg");
	});

	test("uses name as img alt by default", () => {
		const { getByAltText } = render(
			<Avatar src="/photo.jpg" name="Ana Lima" />,
		);

		expect(getByAltText("Ana Lima")).toBeTruthy();
	});

	test("uses explicit alt prop on img", () => {
		const { getByAltText } = render(
			<Avatar src="/photo.jpg" name="Ana Lima" alt="Profile picture" />,
		);

		expect(getByAltText("Profile picture")).toBeTruthy();
	});

	test("renders initials when src is absent", () => {
		const { getByRole, queryByRole } = render(<Avatar name="Ana Lima" />);

		expect(queryByRole("img", { name: "" })).toBeNull();
		expect(getByRole("img", { name: "Ana Lima" }).textContent).toBe("AL");
	});

	test("derives two initials from a multi-word name", () => {
		const { getByRole } = render(<Avatar name="John Michael Doe" />);

		expect(getByRole("img", { name: "John Michael Doe" }).textContent).toBe(
			"JM",
		);
	});

	test("renders a single initial from a single-word name", () => {
		const { getByRole } = render(<Avatar name="Ana" />);

		expect(getByRole("img", { name: "Ana" }).textContent).toBe("A");
	});

	test("initials wrapper has aria-label equal to name", () => {
		const { getByRole } = render(<Avatar name="Carlos Silva" />);

		const initials = getByRole("img", { name: "Carlos Silva" });

		expect(initials.getAttribute("aria-label")).toBe("Carlos Silva");
	});

	test("renders nothing visible when neither src nor name is given", () => {
		const { container } = render(<Avatar />);

		expect(container.firstChild).toBeTruthy();
	});
});
