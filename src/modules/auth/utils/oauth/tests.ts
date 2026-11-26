import type { QueryClient } from "@tanstack/react-query";

import { redirect } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getMeKey } from "@modules/users";

import {
	clearOAuthRedirect,
	getOAuthRedirect,
	oauthCallbackBeforeLoad,
	startOAuthLogin,
} from ".";

vi.mock("@tanstack/react-router", () => ({
	redirect: vi.fn(),
}));

describe("oauth utils", () => {
	const assignMock = vi.fn();

	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
		vi.stubGlobal("location", {
			origin: "http://localhost:5173",
			assign: assignMock,
		});
	});

	afterEach(() => {
		sessionStorage.clear();
		vi.clearAllMocks();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("startOAuthLogin sends the browser to the provider login", () => {
		startOAuthLogin("github", "/account");

		expect(assignMock).toHaveBeenCalledWith(
			"http://localhost:8080/auth/github/login?redirect_uri=" +
				encodeURIComponent("http://localhost:5173/oauth/callback"),
		);
	});

	test("startOAuthLogin stashes the in-app redirect target", () => {
		startOAuthLogin("google", "/account");

		expect(getOAuthRedirect()).toBe("/account");
	});

	test("getOAuthRedirect defaults to home without a stash", () => {
		expect(getOAuthRedirect()).toBe("/");
	});

	test("getOAuthRedirect rejects an unsafe stashed target", () => {
		sessionStorage.setItem("oauth-redirect", "//evil.com");

		expect(getOAuthRedirect()).toBe("/");
	});

	test("clearOAuthRedirect removes the stash", () => {
		startOAuthLogin("google", "/account");
		clearOAuthRedirect();

		expect(getOAuthRedirect()).toBe("/");
	});

	describe("oauthCallbackBeforeLoad", () => {
		const invalidateQueries = vi.fn();
		const context = {
			queryClient: { invalidateQueries } as unknown as QueryClient,
		};

		test("refreshes the session and redirects to the stashed target", async () => {
			const redirectResult = { reason: "oauth-done" };
			vi.mocked(redirect).mockReturnValueOnce(
				redirectResult as unknown as ReturnType<typeof redirect>,
			);
			startOAuthLogin("google", "/account");

			await expect(
				oauthCallbackBeforeLoad({ context, search: {} }),
			).rejects.toBe(redirectResult);

			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: [getMeKey] });
			expect(redirect).toHaveBeenCalledWith({ to: "/account", replace: true });
			expect(getOAuthRedirect()).toBe("/");
		});

		test("stays on the page when verification is required", async () => {
			await expect(
				oauthCallbackBeforeLoad({
					context,
					search: { verification: "required" },
				}),
			).resolves.toBeUndefined();

			expect(redirect).not.toHaveBeenCalled();
		});

		test("forgets the stashed target when the provider reported an error", async () => {
			startOAuthLogin("google", "/account");

			await oauthCallbackBeforeLoad({
				context,
				search: { error: "access_denied" },
			});

			expect(getOAuthRedirect()).toBe("/");
		});

		test("keeps the stashed target while verification is required", async () => {
			startOAuthLogin("google", "/account");

			await oauthCallbackBeforeLoad({
				context,
				search: { verification: "required" },
			});

			expect(getOAuthRedirect()).toBe("/account");
		});

		test("stays on the page when the provider reported an error", async () => {
			await expect(
				oauthCallbackBeforeLoad({
					context,
					search: { error: "access_denied" },
				}),
			).resolves.toBeUndefined();

			expect(redirect).not.toHaveBeenCalled();
		});
	});
});
