import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { useLogoutOthers } from "@modules/auth/services/logout-others";

import { LogoutOthers } from ".";

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/auth/services/logout-others", () => ({
	useLogoutOthers: vi.fn(),
}));

describe("LogoutOthers", () => {
	const mutateMock = vi.fn();

	function mockMutation(state: Record<string, unknown> = {}) {
		vi.mocked(useLogoutOthers).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			isSuccess: false,
			error: null,
			...state,
		} as unknown as ReturnType<typeof useLogoutOthers>);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		mockMutation();
	});

	afterEach(() => {
		cleanup();
	});

	test("logs out the other sessions on click", () => {
		render(<LogoutOthers />);

		fireEvent.click(
			screen.getByRole("button", { name: "logoutOthers.button" }),
		);

		expect(mutateMock).toHaveBeenCalledTimes(1);
	});

	test("disables the button while pending", () => {
		mockMutation({ isPending: true });
		render(<LogoutOthers />);

		expect(
			(
				screen.getByRole("button", {
					name: "logoutOthers.button",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("shows a success message", () => {
		mockMutation({ isSuccess: true });
		render(<LogoutOthers />);

		expect(screen.getByText("logoutOthers.success")).toBeDefined();
	});

	test("shows the API error", () => {
		mockMutation({
			error: new APIError("auth.internalServerError", { status: 500 }),
		});
		render(<LogoutOthers />);

		expect(
			screen.getByText("translated:auth.internalServerError"),
		).toBeDefined();
		expect(
			screen
				.getByText("translated:auth.internalServerError")
				.closest('[role="alert"]'),
		).not.toBeNull();
	});

	test("is a compact outline button without its own description", () => {
		render(<LogoutOthers />);

		const button = screen.getByRole("button", { name: "logoutOthers.button" });

		expect(screen.queryByText("logoutOthers.description")).toBeNull();
		expect(button.className).toContain("border-border-control");
		expect(button.className).toContain("self-end");
	});
});
