import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@src/lib/api";

/**
 * Data required to perform a registration request.
 */
interface RegisterData {
	/** User's email address. */
	email: string;
	/** User's full name. */
	name: string;
	/** User's plain-text password. */
	password: string;
}

/**
 * Sends a POST request to the users endpoint to register a new user.
 *
 * @param data - The registration data (email, name, and password).
 * @returns A promise that resolves when the registration is successful.
 */
async function register({ email, name, password }: RegisterData) {
	await client.post("/users", {
		data: {
			email,
			name,
			password,
		},
	});
}

/**
 * Cache key used for the register mutation.
 */
export const registerKey = "auth/register";

/**
 * Hook to manage the register mutation state using TanStack Query.
 *
 * @remarks
 * On successful registration, all queries are invalidated to ensure that any
 * user-specific data is refetched, reflecting the logged-in state.
 *
 * @returns The mutation object for managing the registration process, including
 * pending, error, and success states.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useRegister();
 *
 * function handleSubmit(data: RegisterData) {
 *   mutate(data, {
 *     onSuccess: () => {
 *       // Handle successful registration (e.g., redirect)
 *     }
 *   });
 * };
 * ```
 */
export function useRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [registerKey],
		mutationFn: register,
		onSuccess: () => {
			// Invalidate all queries to ensure that any user-specific data is refetched.
			queryClient.invalidateQueries();
		},
	});
}
