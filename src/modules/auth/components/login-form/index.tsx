import type { SubmitEvent, SyntheticEvent } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { APIError } from "@src/lib/api";
import { Button, TextInput } from "@src/modules/shared";

import { useLogin } from "../../services";
import { styles } from "./styles";

const EMAIL_INPUT_NAME = "email";
const PASSWORD_INPUT_NAME = "password";

/**
 * LoginForm component is responsible for rendering the login form and
 * handling its submission.
 */
export function LoginForm() {
	const navigate = useNavigate();

	const { mutate: login, isPending } = useLogin();
	const [loginError, setLoginError] = useState<string | null>(null);

	const [emailMessage, setEmailMessage] = useState("");
	const [passwordMessage, setPasswordMessage] = useState("");

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const form = event.currentTarget;
		const formData = new FormData(form);

		login(
			{
				email: String(formData.get(EMAIL_INPUT_NAME)),
				password: String(formData.get(PASSWORD_INPUT_NAME)),
			},
			{
				onError: (error) => {
					if (error instanceof APIError) {
						setLoginError(error.message);
						return;
					}
					setLoginError(
						"An unexpected error occurred. Please try again later.",
					);
				},
				onSuccess: () => {
					form.reset();
					setLoginError(null);
					setEmailMessage("");
					setPasswordMessage("");
					navigate({
						to: "/",
					});
				},
			},
		);
	}

	function handleInvalidEmail(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			setEmailMessage("Please enter your email address.");
			return;
		}

		if (validity.typeMismatch) {
			setEmailMessage("Please enter a valid email address.");
			return;
		}

		if (validity.tooShort) {
			setEmailMessage("Email must have at least 5 characters.");
			return;
		}
	}

	function handleInvalidPassword(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			setPasswordMessage("Please enter your password.");
		}
	}

	return (
		<form onSubmit={handleSubmit} className={styles()}>
			<p className="min-h-12 text-danger">{loginError}</p>
			<TextInput
				name={EMAIL_INPUT_NAME}
				label="Email"
				placeholder="Enter your email"
				type="email"
				onChange={() => setEmailMessage("")}
				onInvalid={handleInvalidEmail}
				message={emailMessage}
				isError={!!emailMessage}
				minLength={5}
				required
			/>
			<TextInput
				name={PASSWORD_INPUT_NAME}
				label="Password"
				placeholder="Enter your password"
				type="password"
				onChange={() => setPasswordMessage("")}
				onInvalid={handleInvalidPassword}
				message={passwordMessage}
				isError={!!passwordMessage}
				required
			/>
			<Button type="submit" disabled={isPending}>
				Login
			</Button>
		</form>
	);
}
