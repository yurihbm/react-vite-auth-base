import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useAuth } from "@modules/auth/hooks";

import { PrivateOutlet } from ".";

vi.mock("@tanstack/react-router", () => ({
	Outlet: () => <p>private page</p>,
}));

vi.mock("@modules/auth/hooks", () => ({
	useAuth: vi.fn(),
}));

describe("PrivateOutlet", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders the private page while the user is signed in", () => {
		vi.mocked(useAuth).mockReturnValue({
			user: {} as never,
			isPending: false,
			isAuthenticated: true,
		});

		render(<PrivateOutlet />);

		expect(screen.getByText("private page")).toBeDefined();
	});

	test("renders nothing once the user is signed out", () => {
		vi.mocked(useAuth).mockReturnValue({
			user: null,
			isPending: true,
			isAuthenticated: false,
		});

		render(<PrivateOutlet />);

		expect(screen.queryByText("private page")).toBeNull();
	});
});
