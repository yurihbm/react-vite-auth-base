import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { jsonResponse, mockFetch } from "@lib/tests";
import { StepUpContext } from "@modules/auth/providers/step-up/context";

import { changePasswordKey, useChangePassword } from ".";

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

describe("useChangePassword", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the new password and accepts 204", async () => {
		const requestStepUp = vi.fn();
		const fetchMock = mockFetch({
			"POST /users/me/password": new Response(null, { status: 204 }),
		});

		const { result } = renderHook(() => useChangePassword(), {
			wrapper: wrapperWith(requestStepUp),
		});

		await act(async () => {
			await result.current.mutateAsync({ newPassword: "s3cret-pass" });
		});

		const [call] = fetchMock.callsTo("POST /users/me/password");
		expect(JSON.parse(String(call.init.body))).toEqual({
			new_password: "s3cret-pass",
		});
		expect(requestStepUp).not.toHaveBeenCalled();
		expect(changePasswordKey).toBe("users/change-password");
	});

	test("asks for a step-up and retries on 403 auth.stepUp.required", async () => {
		const requestStepUp = vi.fn().mockResolvedValue(undefined);
		const fetchMock = mockFetch({
			"POST /users/me/password": [
				jsonResponse({ error: "auth.stepUp.required", message: "x" }, 403),
				new Response(null, { status: 204 }),
			],
		});

		const { result } = renderHook(() => useChangePassword(), {
			wrapper: wrapperWith(requestStepUp),
		});

		await act(async () => {
			await result.current.mutateAsync({ newPassword: "s3cret-pass" });
		});

		expect(requestStepUp).toHaveBeenCalledTimes(1);
		expect(fetchMock.callsTo("POST /users/me/password")).toHaveLength(2);
	});

	test("does not ask for a step-up on another 403", async () => {
		const requestStepUp = vi.fn();
		mockFetch({
			"POST /users/me/password": jsonResponse(
				{ error: "users.forbidden", message: "x" },
				403,
			),
		});

		const { result } = renderHook(() => useChangePassword(), {
			wrapper: wrapperWith(requestStepUp),
		});

		await expect(
			result.current.mutateAsync({ newPassword: "s3cret-pass" }),
		).rejects.toMatchObject({ key: "users.forbidden" });
		expect(requestStepUp).not.toHaveBeenCalled();
	});
});
