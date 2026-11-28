import { useNavigate } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useAuth } from "@modules/auth/hooks";
import { useLogout } from "@modules/auth/services";

import { AccountMenu } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@modules/auth/hooks", () => ({
	useAuth: vi.fn(),
}));

vi.mock("@modules/auth/services", () => ({
	useLogout: vi.fn(),
}));

describe("AccountMenu", () => {
	const navigateMock = vi.fn();
	const logoutMock = vi.fn();

	beforeEach(() => {
		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useAuth).mockReturnValue({
			isAuthenticated: true,
			user: { name: "Test User", email: "test@mail.com" },
		} as unknown as ReturnType<typeof useAuth>);
		vi.mocked(useLogout).mockReturnValue({
			mutate: logoutMock,
			isPending: false,
		} as unknown as ReturnType<typeof useLogout>);
	});

	afterEach(() => {
		cleanup();
	});

	function openMenu() {
		fireEvent.click(
			screen.getByRole("button", { name: /accountMenu\.trigger/ }),
		);
	}

	test("renders a menu trigger with the user's name", () => {
		render(<AccountMenu />);

		const trigger = screen.getByRole("button", {
			name: /accountMenu\.trigger/,
		});

		expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
		expect(trigger.textContent).toContain("Test User");
	});

	test("goes to the account page", () => {
		render(<AccountMenu />);

		openMenu();
		fireEvent.click(
			screen.getByRole("menuitem", { name: "accountMenu.account" }),
		);

		expect(navigateMock).toHaveBeenCalledWith({ to: "/account" });
	});

	test("logs out and goes home", () => {
		render(<AccountMenu />);

		openMenu();
		fireEvent.click(
			screen.getByRole("menuitem", { name: "accountMenu.logout" }),
		);

		expect(logoutMock).toHaveBeenCalledTimes(1);

		const [, options] = logoutMock.mock.calls[0];
		options.onSuccess();

		expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
	});

	test("disables logout while it is in progress", () => {
		vi.mocked(useLogout).mockReturnValue({
			mutate: logoutMock,
			isPending: true,
		} as unknown as ReturnType<typeof useLogout>);
		render(<AccountMenu />);

		openMenu();

		expect(
			screen
				.getByRole("menuitem", { name: "accountMenu.logout" })
				.getAttribute("aria-disabled"),
		).toBe("true");
	});

	test("renders nothing without a user", () => {
		vi.mocked(useAuth).mockReturnValue({
			isAuthenticated: false,
			user: undefined,
		} as unknown as ReturnType<typeof useAuth>);

		const { container } = render(<AccountMenu />);

		expect(container.innerHTML).toBe("");
	});
});
