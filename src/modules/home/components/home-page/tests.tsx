import type { ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useAuth } from "@modules/auth";

import { HomePage } from ".";

vi.mock("@tanstack/react-router", () => ({
	// Renders the wrapped component as a plain anchor.
	createLink:
		(Component: (props: Record<string, unknown>) => ReactNode) =>
		({ to, search: _search, ...props }: Record<string, unknown>) => (
			<Component {...props} href={to} />
		),
	Link: ({
		to,
		children,
		className,
	}: {
		to: string;
		children: ReactNode;
		className?: string;
	}) => (
		<a className={className} href={to}>
			{children}
		</a>
	),
}));

vi.mock("@modules/auth", () => ({
	useAuth: vi.fn(),
}));

function mockAuth(user: { name: string; role: "user" | "admin" } | null) {
	vi.mocked(useAuth).mockReturnValue({
		user,
		isAuthenticated: !!user,
		isPending: false,
	} as unknown as ReturnType<typeof useAuth>);
}

describe("HomePage", () => {
	afterEach(() => {
		cleanup();
	});

	describe("signed out", () => {
		test("renders correctly", () => {
			mockAuth(null);

			const { container } = render(<HomePage />);

			expect(container).toMatchSnapshot();
		});

		test("states the value in the page's h1 and offers log in and sign up", () => {
			mockAuth(null);

			render(<HomePage />);

			expect(
				screen.getByRole("heading", { level: 1, name: "guest.title" }),
			).toBeTruthy();
			expect(
				screen.getByRole("link", { name: "guest.logIn" }).getAttribute("href"),
			).toBe("/login");
			expect(
				screen
					.getByRole("link", { name: "guest.createAccount" })
					.getAttribute("href"),
			).toBe("/register");
		});
	});

	describe("signed in", () => {
		test("welcomes the user and links to account and security", () => {
			mockAuth({ name: "Test User", role: "user" });

			render(<HomePage />);

			expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
			expect(
				screen
					.getByRole("link", { name: /shortcuts\.account\.title/ })
					.getAttribute("href"),
			).toBe("/account");
			expect(
				screen
					.getByRole("link", { name: /shortcuts\.security\.title/ })
					.getAttribute("href"),
			).toBe("/account/security");
			expect(
				screen.queryByRole("link", { name: /shortcuts\.users/ }),
			).toBeNull();
		});

		test("adds the admin shortcuts for admins", () => {
			mockAuth({ name: "Admin User", role: "admin" });

			render(<HomePage />);

			expect(
				screen
					.getByRole("link", { name: /shortcuts\.users\.title/ })
					.getAttribute("href"),
			).toBe("/admin/users");
			expect(
				screen
					.getByRole("link", { name: /shortcuts\.auditLogs\.title/ })
					.getAttribute("href"),
			).toBe("/admin/audit-logs");
		});

		test("does not offer log in or sign up", () => {
			mockAuth({ name: "Test User", role: "user" });

			render(<HomePage />);

			expect(screen.queryByRole("link", { name: "guest.logIn" })).toBeNull();
		});
	});
});
