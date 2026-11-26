import { Outlet } from "@tanstack/react-router";

import { useAuth } from "@modules/auth/hooks";

/**
 * PrivateOutlet renders the private child route only while the user is signed
 * in, so pages can rely on `useAuth<true>()`. When the session ends (expired,
 * logged out, email changed), the cached user is dropped before the redirect to
 * the login page commits; meanwhile nothing is rendered.
 */
export function PrivateOutlet() {
	const { isAuthenticated } = useAuth();

	return isAuthenticated ? <Outlet /> : null;
}
