import { useQueryClient } from "@tanstack/react-query";
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
import {
	getUserKey,
	listUsersKey,
	useDeleteUser,
} from "@modules/users/services";

import { DeleteUser } from ".";

vi.mock("@tanstack/react-query", () => ({
	useQueryClient: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/users/services", () => ({
	getUserKey: "users/get",
	listUsersKey: "users/list",
	useDeleteUser: vi.fn(),
}));

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

describe("DeleteUser", () => {
	const onDeleted = vi.fn();
	const invalidateQueriesMock = vi.fn();
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
		fireEvent.click(screen.getByRole("button", { name: "deleteUser.button" }));
	}

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useQueryClient).mockReturnValue({
			invalidateQueries: invalidateQueriesMock,
			removeQueries: removeQueriesMock,
		} as unknown as ReturnType<typeof useQueryClient>);
		mockMutation();
	});

	afterEach(() => {
		cleanup();
	});

	test("asks for confirmation before deleting", () => {
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		expect(screen.queryByRole("dialog")).toBeNull();

		openDialog();

		expect(screen.getByRole("dialog")).toBeDefined();
		expect(mutateMock).not.toHaveBeenCalled();
	});

	test("deletes the user once confirmed", () => {
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		openDialog();
		fireEvent.click(
			screen.getByRole("button", { name: "deleteUser.confirm.confirmButton" }),
		);

		expect(mutateMock).toHaveBeenCalledWith(
			{ uuid: UUID },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);
	});

	test("refreshes the users list, drops the deleted user and notifies after deleting", () => {
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		openDialog();
		fireEvent.click(
			screen.getByRole("button", { name: "deleteUser.confirm.confirmButton" }),
		);
		const [, handlers] = mutateMock.mock.calls[0] as [
			unknown,
			{ onSuccess: () => void },
		];
		act(() => handlers.onSuccess());

		expect(invalidateQueriesMock).toHaveBeenCalledWith({
			queryKey: [listUsersKey],
		});
		expect(removeQueriesMock).toHaveBeenCalledWith({
			queryKey: [getUserKey, UUID],
		});
		expect(onDeleted).toHaveBeenCalledTimes(1);
	});

	test("shows the API error in the dialog", () => {
		mockMutation({
			error: new APIError("auth.stepUp.required", { status: 403 }),
		});
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		openDialog();

		expect(screen.getByText("translated:auth.stepUp.required")).toBeDefined();
		expect(
			screen
				.getByText("translated:auth.stepUp.required")
				.closest('[role="alert"]'),
		).not.toBeNull();
	});

	test("shows nothing when the step-up was cancelled", () => {
		mockMutation({ error: new StepUpCancelledError() });
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		openDialog();

		expect(screen.queryByText(/^translated:|^unknown$/)).toBeNull();
	});

	test("closes the dialog on cancel without deleting", async () => {
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		openDialog();
		fireEvent.click(
			screen.getByRole("button", { name: "deleteUser.confirm.cancelButton" }),
		);

		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		expect(mutateMock).not.toHaveBeenCalled();
	});

	test("disables confirm while deleting", () => {
		mockMutation({ isPending: true });
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		openDialog();

		expect(
			(
				screen.getByRole("button", {
					name: "deleteUser.confirm.confirmButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("styles cancel as an outline button", () => {
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		openDialog();

		const cancel = screen.getByRole("button", {
			name: "deleteUser.confirm.cancelButton",
		});

		expect(cancel.className).toContain("border-border-control");
	});

	test("is a compact danger button without its own description", () => {
		render(<DeleteUser uuid={UUID} onDeleted={onDeleted} />);

		expect(screen.queryByText("deleteUser.description")).toBeNull();
		expect(
			screen.getByRole("button", { name: "deleteUser.button" }).className,
		).toContain("self-end");
	});
});
