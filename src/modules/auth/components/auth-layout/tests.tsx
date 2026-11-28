import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { AuthLayout } from ".";

describe("AuthLayout", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<AuthLayout description="Welcome back." title="Sign in">
				<form aria-label="Sign in form" />
			</AuthLayout>,
		);

		expect(container).toMatchSnapshot();
	});

	test("renders the title as the page's only h1 with its description", () => {
		render(
			<AuthLayout description="Welcome back." title="Sign in">
				Content
			</AuthLayout>,
		);

		expect(
			screen.getByRole("heading", { level: 1, name: "Sign in" }),
		).toBeTruthy();
		expect(screen.getAllByRole("heading")).toHaveLength(1);
		expect(screen.getByText("Welcome back.")).toBeTruthy();
		expect(screen.getByText("Content")).toBeTruthy();
	});

	test("renders the alert above the content and the footer below it", () => {
		render(
			<AuthLayout
				alert={<div role="alert">Session expired</div>}
				footer={<a href="/register">Create an account</a>}
				title="Sign in"
			>
				<p>Content</p>
			</AuthLayout>,
		);

		const alert = screen.getByRole("alert");
		const content = screen.getByText("Content");
		const footerLink = screen.getByRole("link", { name: "Create an account" });

		expect(
			alert.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(
			content.compareDocumentPosition(footerLink) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	test("omits the optional parts when not given", () => {
		const { container } = render(<AuthLayout title="Sign in">x</AuthLayout>);

		expect(container.querySelector("p")).toBeNull();
		expect(screen.queryByRole("alert")).toBeNull();
	});

	test("titles the browser tab with the page title", () => {
		render(<AuthLayout title="Sign in">x</AuthLayout>);

		expect(document.title).toBe(`Sign in | ${import.meta.env.VITE_APP_NAME}`);
	});
});
