import type { User } from "@src/modules/users";

import { useGetMe } from "@src/modules/users";

interface AuthenticatedUserResult {
	/** The authenticated user object. */
	user: User;
	/** Indicates that no authentication request is currently pending. */
	isPending: false;
	/** Indicates that the user is successfully authenticated. */
	isAuthenticated: true;
}

interface UnauthenticatedUserResult {
	/** The user object is null when not authenticated. */
	user: null;
	/** Indicates whether an authentication request is currently in progress. */
	isPending: boolean;
	/** Indicates that the user is not authenticated. */
	isAuthenticated: false;
}

/**
 * Represents the authentication state returned by the `useAuth` hook.
 */
type UseAuthResult<Authenticated extends boolean = false> =
	Authenticated extends true
		? AuthenticatedUserResult
		: AuthenticatedUserResult | UnauthenticatedUserResult;

/**
 * A hook that provides the current authentication status and user information.
 *
 * It uses the `useGetMe` service to fetch the current user's profile and
 * normalizes query states into an auth-focused shape.
 *
 * @remarks
 * - `isAuthenticated` is only `true` when a valid `user` is available.
 * - Request errors are treated as unauthenticated states.
 * - During request failure, `isPending` is forced to `false`.
 *
 * @template Authenticated - A boolean type parameter that indicates whether
 * the user is authenticated. Useful for private routes where the user must
 * be authenticated, allowing for more precise typing of the returned object.
 *
 * @returns {UseAuthResult} An object containing the user data, loading state, and authentication status.
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, isPending } = useAuth();
 *
 * if (isPending) return <Loading />;
 * if (!isAuthenticated) return <LoginRedirect />;
 *
 * return <div>Welcome, {user.name}!</div>;
 * ```
 */
export function useAuth<
	Authenticated extends boolean = false,
>(): UseAuthResult<Authenticated> {
	const { data: user, isSuccess, isPending, isError } = useGetMe();

	if (isPending || isError) {
		return {
			user: null,
			isPending: isError ? false : isPending,
			isAuthenticated: false,
		} as UseAuthResult<Authenticated>;
	}

	if (isSuccess && user) {
		return {
			user,
			isPending: false,
			isAuthenticated: true,
		};
	}

	return {
		user: null,
		isPending: false,
		isAuthenticated: false,
	} as UseAuthResult<Authenticated>;
}
