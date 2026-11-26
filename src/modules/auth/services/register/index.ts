import { useMutation } from "@tanstack/react-query";

import { client } from "@lib/api";

/** Data required to perform a registration request. */
interface RegisterData {
	/** User's email address. */
	email: string;
	/** User's full name. */
	name: string;
	/** User's plain-text password. */
	password: string;
}

/**
 * Sends a POST request to the users endpoint to start a sign-up. The API only
 * creates a pending sign-up and emails a code; the user is not logged in until
 * the code is verified.
 *
 * @param data - The registration data (email, name, and password).
 * @returns A promise that resolves when the sign-up is pending.
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

/** Cache key used for the register mutation. */
export const registerKey = "auth/register";

/**
 * Hook to manage the register mutation state using TanStack Query.
 *
 * @remarks
 *   On success the sign-up is only pending, so the user is not logged in yet
 *   and nothing is invalidated. Continue with `useVerifySignup`.
 * @example
 * 	```tsx
 * 	const { mutate, isPending } = useRegister();
 *
 * 	function handleSubmit(data: RegisterData) {
 * 		mutate(data, {
 * 			onSuccess: () => {
 * 				// Handle the pending sign-up (e.g., go to code verification)
 * 			},
 * 		});
 * 	}
 * 	```;
 *
 * @returns The mutation object for managing the registration process, including
 *   pending, error, and success states.
 */
export function useRegister() {
	return useMutation({
		mutationKey: [registerKey],
		mutationFn: register,
	});
}
