import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@src/lib/api";

/**
 * Data required to perform a login request.
 */
interface LoginData {
	/** User's email address. */
	email: string;
	/** User's plain-text password. */
	password: string;
}

/**
 * Sends a POST request to the authentication endpoint to log in a user.
 *
 * @param data - The login credentials (email and password).
 * @returns A promise that resolves when the login is successful.
 */
async function login({ email, password }: LoginData) {
	await client.post("/auth/login", {
		data: {
			email,
			password,
		},
	});
}

/**
 * Cache key used for the login mutation.
 */
export const loginKey = "auth/login";

/**
 * Hook to manage the login mutation state using TanStack Query.
 *
 * @remarks
 * On successful login, all queries are invalidated to ensure that any
 * user-specific data is refetched, reflecting the logged-in state.
 *
 * @returns The mutation object for managing the login process, including
 * pending, error, and success states.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useLogin();
 *
 * function handleSubmit(data: LoginData) {
 *   mutate(data, {
 *     onSuccess: () => {
 *       // Handle successful login (e.g., redirect)
 *     }
 *   });
 * };
 * ```
 */
export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [loginKey],
		mutationFn: login,
		onSuccess: () => {
			// Invalidate all queries to ensure that any user-specific data is refetched.
			queryClient.invalidateQueries();
		},
	});
}
