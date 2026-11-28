import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { jsonResponse, mockFetch } from "@lib/tests";
import { StepUpContext } from "@modules/auth/providers/step-up/context";

import { deleteUserKey, useDeleteUser } from ".";

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

function wrapperWith(requestStepUp: () => Promise<void>) {
	const queryClient = new QueryClient();

	return ({ children }: { children: React.ReactNode }) =>
		createElement(
			QueryClientProvider,
			{ client: queryClient },
			createElement(
				StepUpContext.Provider,
				{ value: { requestStepUp } },
				children,
			),
		);
}

describe("useDeleteUser", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("deletes the user and accepts 204", async () => {
		const fetchMock = mockFetch({
			[`DELETE /users/${UUID}`]: new Response(null, { status: 204 }),
		});

		const { result } = renderHook(() => useDeleteUser(), {
			wrapper: wrapperWith(vi.fn()),
		});

		await act(async () => {
			await result.current.mutateAsync({ uuid: UUID });
		});

		expect(fetchMock.callsTo(`DELETE /users/${UUID}`)).toHaveLength(1);
		expect(deleteUserKey).toBe("users/delete");
	});

	test("asks for a step-up and retries on 403 auth.stepUp.required", async () => {
		const requestStepUp = vi.fn().mockResolvedValue(undefined);
		const fetchMock = mockFetch({
			[`DELETE /users/${UUID}`]: [
				jsonResponse({ error: "auth.stepUp.required", message: "x" }, 403),
				new Response(null, { status: 204 }),
			],
		});

		const { result } = renderHook(() => useDeleteUser(), {
			wrapper: wrapperWith(requestStepUp),
		});

		await act(async () => {
			await result.current.mutateAsync({ uuid: UUID });
		});

		expect(requestStepUp).toHaveBeenCalledTimes(1);
		expect(fetchMock.callsTo(`DELETE /users/${UUID}`)).toHaveLength(2);
	});

	test("rejects with the email change lock", async () => {
		mockFetch({
			[`DELETE /users/${UUID}`]: jsonResponse(
				{ error: "users.emailChange.locked", message: "x" },
				409,
			),
		});

		const { result } = renderHook(() => useDeleteUser(), {
			wrapper: wrapperWith(vi.fn()),
		});

		await expect(
			result.current.mutateAsync({ uuid: UUID }),
		).rejects.toMatchObject({ key: "users.emailChange.locked", status: 409 });
	});
});
