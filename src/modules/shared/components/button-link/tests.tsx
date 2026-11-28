import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { ButtonLink } from ".";

function renderInRouter(ui: () => React.ReactNode) {
	const rootRoute = createRootRoute();
	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: ui,
	});
	const router = createRouter({
		routeTree: rootRoute.addChildren([indexRoute]),
		history: createMemoryHistory(),
	});

	return render(<RouterProvider router={router} />);
}

describe("ButtonLink", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders a router link styled as a button", async () => {
		renderInRouter(() => (
			<ButtonLink to="/account/security" variant="outline">
				Manage security
			</ButtonLink>
		));

		const link = await screen.findByRole("link", { name: "Manage security" });

		expect(link.getAttribute("href")).toBe("/account/security");
		expect(link.className).toContain("border-border-control");
		expect(link.getAttribute("type")).toBeNull();
	});
});
