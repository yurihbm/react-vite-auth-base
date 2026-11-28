import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { useUpdateUser } from "@modules/users/services";

import { EditNameForm } from ".";

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/users/services", () => ({
	useUpdateUser: vi.fn(),
}));

const USER = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "John Doe",
	email: "john@doe.com",
	role: "user" as const,
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};

describe("EditNameForm", () => {
	const mutateMock = vi.fn();

	function mockMutation(state: Record<string, unknown> = {}) {
		vi.mocked(useUpdateUser).mockReturnValue({
			mutate: mutateMock,
			isPending: false,
			isSuccess: false,
			error: null,
			...state,
		} as unknown as ReturnType<typeof useUpdateUser>);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		mockMutation();
	});

	afterEach(() => {
		cleanup();
	});

	test("starts with the current name", () => {
		render(<EditNameForm user={USER} />);

		expect(
			(
				screen.getByLabelText(
					"editNameForm.input.name.label",
				) as HTMLInputElement
			).value,
		).toBe("John Doe");
	});

	test("submits the new name for the user", () => {
		render(<EditNameForm user={USER} />);

		fireEvent.change(screen.getByLabelText("editNameForm.input.name.label"), {
			target: { value: "Jane Doe" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: "editNameForm.submitButton" }),
		);

		expect(mutateMock).toHaveBeenCalledWith({
			uuid: USER.uuid,
			name: "Jane Doe",
		});
	});

	test("disables submit while pending", () => {
		mockMutation({ isPending: true });
		render(<EditNameForm user={USER} />);

		expect(
			(
				screen.getByRole("button", {
					name: "editNameForm.submitButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("shows a success message", () => {
		mockMutation({ isSuccess: true });
		render(<EditNameForm user={USER} />);

		expect(screen.getByText("editNameForm.success")).toBeDefined();
	});

	test("shows the API error and maps details onto the input", () => {
		mockMutation({
			error: new APIError("request.validation_failed", {
				status: 400,
				details: { name: "name is too short" },
			}),
		});
		render(<EditNameForm user={USER} />);

		expect(
			screen.getByText("translated:request.validation_failed"),
		).toBeDefined();
		expect(screen.getByText("name is too short")).toBeDefined();
	});

	test("shows nothing when the step-up was cancelled", () => {
		mockMutation({ error: new StepUpCancelledError() });
		render(<EditNameForm user={USER} />);

		expect(screen.queryByText(/^translated:|^unknown$/)).toBeNull();
	});
});
