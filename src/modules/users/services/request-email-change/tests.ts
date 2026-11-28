import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { jsonResponse, mockFetch } from "@lib/tests";
import { StepUpContext } from "@modules/auth/providers/step-up/context";

import { requestEmailChangeKey, useRequestEmailChange } from ".";

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

describe("useRequestEmailChange", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("posts the new email and accepts 202", async () => {
		const fetchMock = mockFetch({
			"POST /users/me/email": jsonResponse({ message: "ok" }, 202),
		});

		const { result } = renderHook(() => useRequestEmailChange(), {
			wrapper: wrapperWith(vi.fn()),
		});

		await act(async () => {
			await result.current.mutateAsync({ email: "new@doe.com" });
		});

		const [call] = fetchMock.callsTo("POST /users/me/email");
		expect(JSON.parse(String(call.init.body))).toEqual({
			email: "new@doe.com",
		});
		expect(requestEmailChangeKey).toBe("users/request-email-change");
	});

	test("asks for a step-up and retries on 403 auth.stepUp.required", async () => {
		const requestStepUp = vi.fn().mockResolvedValue(undefined);
		const fetchMock = mockFetch({
			"POST /users/me/email": [
				jsonResponse({ error: "auth.stepUp.required", message: "x" }, 403),
				jsonResponse({ message: "ok" }, 202),
			],
		});

		const { result } = renderHook(() => useRequestEmailChange(), {
			wrapper: wrapperWith(requestStepUp),
		});

		await act(async () => {
			await result.current.mutateAsync({ email: "new@doe.com" });
		});

		expect(requestStepUp).toHaveBeenCalledTimes(1);
		expect(fetchMock.callsTo("POST /users/me/email")).toHaveLength(2);
	});
});
