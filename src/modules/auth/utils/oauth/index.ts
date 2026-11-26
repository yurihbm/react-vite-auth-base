import type { TranslateKey } from "@lib/i18n";
import type { QueryClient } from "@tanstack/react-query";

import { redirect } from "@tanstack/react-router";

import { safeRedirect } from "@modules/auth/utils/safe-redirect";
import { getMeKey } from "@modules/users";

/** Supported OAuth providers. */
export type OAuthProvider = "google" | "github" | "microsoft";

/** Session storage key of the in-app path to open after the OAuth login. */
const REDIRECT_STORAGE_KEY = "oauth-redirect";

/** OAuth error codes the API may send back in the callback's `error` param. */
const OAUTH_ERROR_CODES = [
	"access_denied",
	"account_conflict",
	"invalid_request",
	"invalid_scope",
	"invalid_user_info",
	"missing_code_verifier",
	"server_error",
	"temporarily_unavailable",
	"unauthorized_client",
	"unsupported_response_type",
	"verification_limited",
] as const;

/** Path of the route the provider flow returns to. */
const CALLBACK_PATH = "/oauth/callback";

/**
 * Reads the in-app path stashed by {@link startOAuthLogin}.
 *
 * @returns The stashed path when it is safe, `/` otherwise.
 */
export function getOAuthRedirect(): string {
	return safeRedirect(sessionStorage.getItem(REDIRECT_STORAGE_KEY));
}

/** Forgets the stashed in-app path. */
export function clearOAuthRedirect() {
	sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
}

/**
 * Starts the OAuth login by sending the browser to the API, which redirects to
 * the provider.
 *
 * The API only accepts an exact `redirect_uri` from its allow-list, so the
 * callback URL cannot carry the in-app target. It is stashed in session storage
 * instead.
 *
 * @param provider - The OAuth provider to sign in with.
 * @param redirectTo - The in-app path to open once signed in.
 */
export function startOAuthLogin(provider: OAuthProvider, redirectTo: string) {
	sessionStorage.setItem(REDIRECT_STORAGE_KEY, redirectTo);

	const url = new URL(
		`/auth/${provider}/login`,
		import.meta.env.VITE_API_BASE_URL,
	);
	url.searchParams.set("redirect_uri", `${location.origin}${CALLBACK_PATH}`);

	location.assign(url.toString());
}

/**
 * Route guard of the OAuth callback. When the API logged the user in (no
 * `verification` or `error` param), it refreshes the session and redirects to
 * the stashed in-app path. Otherwise the page handles the outcome.
 *
 * Use it in the beforeLoad hook of the callback route.
 */
export async function oauthCallbackBeforeLoad({
	context,
	search,
}: {
	context: { queryClient: QueryClient };
	search: { verification?: string; error?: string };
}) {
	if (search.error) {
		clearOAuthRedirect();
		return;
	}

	// The verification form clears the stash once the code is verified.
	if (search.verification) {
		return;
	}

	await context.queryClient.invalidateQueries({ queryKey: [getMeKey] });

	const to = getOAuthRedirect();
	clearOAuthRedirect();

	throw redirect({ to, replace: true });
}

/**
 * Resolves the translation key of the callback's `error` param. The param comes
 * from the URL, so only known codes resolve.
 *
 * @param code - The `error` search param of the callback.
 * @returns The `errors` key of a known code, `undefined` otherwise.
 */
export function oauthErrorKey(
	code?: string,
): TranslateKey<"errors"> | undefined {
	const known = OAUTH_ERROR_CODES.find((value) => value === code);
	return known && `oauth.${known}`;
}
