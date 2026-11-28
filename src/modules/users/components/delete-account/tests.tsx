import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { useDeleteUser } from "@modules/users/services";

import { DeleteAccount } from ".";

vi.mock("@tanstack/react-query", () => ({
	useQueryClient: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/users/services", () => ({
	useDeleteUser: vi.fn(),
}));

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

describe("DeleteAccount", () => {
	const navigateMock = vi.fn();
	const removeQueriesMock = vi.fn();
	const mutateMock = vi.fn();

	function mockMutation(state: Record<string, unknown> = {}) {
		vi.mocked(useDeleteUser).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			error: null,
			...state,
		} as unknown as ReturnType<typeof useDeleteUser>);
	}

	function openDialog() {
		fireEvent.click(
			screen.getByRole("button", { name: "deleteAccount.button" }),
		);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		vi.mocked(useQueryClient).mockReturnValue({
			removeQueries: removeQueriesMock,
		} as unknown as ReturnType<typeof useQueryClient>);
		mockMutation();
	});

	afterEach(() => {
		cleanup();
	});

	test("asks for confirmation before deleting", () => {
		render(<DeleteAccount uuid={UUID} />);

		expect(screen.queryByRole("dialog")).toBeNull();

		openDialog();

		expect(screen.getByRole("dialog")).toBeDefined();
		expect(mutateMock).not.toHaveBeenCalled();
	});

	test("deletes the account once confirmed", () => {
		render(<DeleteAccount uuid={UUID} />);

		openDialog();
		fireEvent.click(
			screen.getByRole("button", {
				name: "deleteAccount.confirm.confirmButton",
			}),
		);

		expect(mutateMock).toHaveBeenCalledWith(
			{ uuid: UUID },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);
	});

	test("clears local state and goes home after deleting", () => {
		render(<DeleteAccount uuid={UUID} />);

		openDialog();
		fireEvent.click(
			screen.getByRole("button", {
				name: "deleteAccount.confirm.confirmButton",
			}),
		);
		const [, handlers] = mutateMock.mock.calls[0] as [
			unknown,
			{ onSuccess: () => void },
		];
		act(() => handlers.onSuccess());

		expect(removeQueriesMock).toHaveBeenCalledTimes(1);
		expect(navigateMock).toHaveBeenCalledWith({ to: "/" });
	});

	test("shows the email change lock error in the dialog", () => {
		mockMutation({
			error: new APIError("users.emailChange.locked", { status: 409 }),
		});
		render(<DeleteAccount uuid={UUID} />);

		openDialog();

		expect(
			screen.getByText("translated:users.emailChange.locked"),
		).toBeDefined();
	});

	test("shows nothing when the step-up was cancelled", () => {
		mockMutation({ error: new StepUpCancelledError() });
		render(<DeleteAccount uuid={UUID} />);

		openDialog();

		expect(screen.queryByText(/^translated:|^unknown$/)).toBeNull();
	});

	test("closes the dialog on cancel", async () => {
		render(<DeleteAccount uuid={UUID} />);

		openDialog();
		fireEvent.click(
			screen.getByRole("button", {
				name: "deleteAccount.confirm.cancelButton",
			}),
		);

		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});
});
