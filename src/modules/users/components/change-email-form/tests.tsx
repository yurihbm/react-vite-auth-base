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
import {
	useConfirmEmailChange,
	useRequestEmailChange,
} from "@modules/users/services";

import { ChangeEmailForm } from ".";

vi.mock("@tanstack/react-router", () => ({
	useNavigate: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/users/services", () => ({
	useRequestEmailChange: vi.fn(),
	useConfirmEmailChange: vi.fn(),
}));

describe("ChangeEmailForm", () => {
	const navigateMock = vi.fn();
	const requestMock = vi.fn();
	const confirmMock = vi.fn();

	function mockMutations(
		request: Record<string, unknown> = {},
		confirm: Record<string, unknown> = {},
	) {
		vi.mocked(useRequestEmailChange).mockReturnValue({
			mutate: requestMock,
			isPending: false,
			error: null,
			...request,
		} as unknown as ReturnType<typeof useRequestEmailChange>);
		vi.mocked(useConfirmEmailChange).mockReturnValue({
			mutate: confirmMock,
			isPending: false,
			error: null,
			...confirm,
		} as unknown as ReturnType<typeof useConfirmEmailChange>);
	}

	function requestChange() {
		fireEvent.change(
			screen.getByLabelText("changeEmailForm.input.email.label"),
			{
				target: { value: "new@doe.com" },
			},
		);
		fireEvent.click(
			screen.getByRole("button", { name: "changeEmailForm.requestButton" }),
		);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useNavigate).mockReturnValue(navigateMock);
		mockMutations();
	});

	afterEach(() => {
		cleanup();
	});

	test("requests the change with the new email", () => {
		render(<ChangeEmailForm />);

		requestChange();

		expect(requestMock).toHaveBeenCalledWith(
			{ email: "new@doe.com" },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);
	});

	test("asks for the code once the request succeeds", () => {
		render(<ChangeEmailForm />);

		requestChange();
		const [, handlers] = requestMock.mock.calls[0] as [
			unknown,
			{ onSuccess: () => void },
		];
		act(() => handlers.onSuccess());

		expect(
			screen.getByLabelText("changeEmailForm.input.code.label"),
		).toBeDefined();
		expect(
			screen.queryByLabelText("changeEmailForm.input.email.label"),
		).toBeNull();
	});

	test("confirms the code and goes to login with a reason", () => {
		render(<ChangeEmailForm />);

		requestChange();
		const [, requested] = requestMock.mock.calls[0] as [
			unknown,
			{ onSuccess: () => void },
		];
		act(() => requested.onSuccess());

		fireEvent.change(
			screen.getByLabelText("changeEmailForm.input.code.label"),
			{
				target: { value: "123456" },
			},
		);
		fireEvent.click(
			screen.getByRole("button", { name: "changeEmailForm.confirmButton" }),
		);

		expect(confirmMock).toHaveBeenCalledWith(
			{ code: "123456" },
			expect.objectContaining({ onSuccess: expect.any(Function) }),
		);

		const [, confirmed] = confirmMock.mock.calls[0] as [
			unknown,
			{ onSuccess: () => void },
		];
		act(() => confirmed.onSuccess());

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/login",
			search: { redirect: "/", reason: "emailChanged" },
		});
	});

	test("shows the request error and disables it after a rate limit", () => {
		mockMutations({
			error: new APIError("users.emailChange.cooldown", { status: 429 }),
		});
		render(<ChangeEmailForm />);

		expect(
			screen.getByText("translated:users.emailChange.cooldown"),
		).toBeDefined();
		expect(
			(
				screen.getByRole("button", {
					name: "changeEmailForm.requestButton",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});
});
