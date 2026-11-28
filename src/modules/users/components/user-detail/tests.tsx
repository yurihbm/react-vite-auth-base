import type { ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useAuth } from "@modules/auth";
import { useGetUser } from "@modules/users/services";

import { UserDetail } from ".";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children }: { to: string; children: ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth", () => ({
	useAuth: vi.fn(),
}));

vi.mock("@modules/users/services", () => ({
	useGetUser: vi.fn(),
}));

vi.mock("@modules/users/components/edit-name-form", () => ({
	EditNameForm: () => <form aria-label="edit name" />,
}));

vi.mock("@modules/users/components/delete-user", () => ({
	DeleteUser: () => <button type="button">delete other</button>,
}));

vi.mock("@modules/users/components/delete-account", () => ({
	DeleteAccount: () => <button type="button">delete self</button>,
}));

const USER = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "John Doe",
	email: "john@doe.com",
	role: "user" as const,
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};

function mockUser(state: Record<string, unknown>) {
	vi.mocked(useGetUser).mockReturnValue({
		data: undefined,
		error: null,
		isPending: false,
		...state,
	} as unknown as ReturnType<typeof useGetUser>);
}

describe("UserDetail", () => {
	const onDeleted = vi.fn();

	beforeEach(() => {
		vi.mocked(useAuth).mockReturnValue({
			user: { ...USER, uuid: "me" },
		} as unknown as ReturnType<typeof useAuth>);
	});

	afterEach(() => {
		cleanup();
	});

	test("shows the person's name as the page's h1 with their role", () => {
		mockUser({ data: USER });

		render(<UserDetail uuid={USER.uuid} onDeleted={onDeleted} />);

		const heading = screen.getByRole("heading", { level: 1 });

		expect(heading.textContent).toContain("John Doe");
		expect(heading.textContent).toContain("user");
		expect(
			screen.getByRole("link", { name: /userPage\.back/ }).getAttribute("href"),
		).toBe("/admin/users");
	});

	test("lists the details and offers the name edit and a danger zone", () => {
		mockUser({ data: USER });

		render(<UserDetail uuid={USER.uuid} onDeleted={onDeleted} />);

		expect(screen.getByText("john@doe.com")).toBeTruthy();
		expect(screen.getByRole("form", { name: "edit name" })).toBeTruthy();

		const dangerZone = screen.getByRole("region", {
			name: "userPage.dangerZone.title",
		});

		expect(dangerZone.className).toContain("border-danger");
		expect(dangerZone.textContent).toContain("delete other");
	});

	test("lets admins delete their own account from their own page", () => {
		mockUser({ data: { ...USER, uuid: "me" } });

		render(<UserDetail uuid="me" onDeleted={onDeleted} />);

		expect(screen.getByRole("button", { name: "delete self" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "delete other" })).toBeNull();
	});

	test("shows an empty state with a way back when the user does not exist", () => {
		mockUser({
			error: new APIError("users.notFound", { status: 404 }),
		});

		render(<UserDetail uuid="missing" onDeleted={onDeleted} />);

		expect(screen.getByText("userPage.notFound.title")).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "userPage.notFound.back" })
				.getAttribute("href"),
		).toBe("/admin/users");
		expect(screen.queryByRole("alert")).toBeNull();
	});

	test("announces other errors", () => {
		mockUser({ error: new APIError("x", { status: 500 }) });

		render(<UserDetail uuid="x" onDeleted={onDeleted} />);

		expect(screen.getByRole("alert").textContent).toContain("translated:x");
	});

	test("shows a placeholder while loading", () => {
		mockUser({ isPending: true });

		const { container } = render(
			<UserDetail uuid={USER.uuid} onDeleted={onDeleted} />,
		);

		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
	});
});
