import type { TranslateKey } from "@src/lib/i18n";
import type { SubmitEvent, SyntheticEvent } from "react";

import { useNavigate } from "@tanstack/react-router";

import { APIError } from "@src/lib/api";
import { useTranslate, useTranslateKeyState } from "@src/lib/i18n";
import { Button, TextInput } from "@src/modules/shared";

import { useLogin } from "../../services";
import { styles } from "./styles";

const EMAIL_INPUT_NAME = "email";
const PASSWORD_INPUT_NAME = "password";

interface LoginFormProps {
	redirectTo?: string;
}

/**
 * LoginForm component is responsible for rendering the login form and
 * handling its submission.
 */
export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
	const navigate = useNavigate();

	const t = useTranslate("auth");
	const emailMessage = useTranslateKeyState("auth");
	const passwordMessage = useTranslateKeyState("auth");
	const loginMessage = useTranslateKeyState("auth");

	const { mutate: login, isPending } = useLogin();

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
						// TODO: map API errors to translation keys.
						loginMessage.setKey(error.message as TranslateKey<"auth">);
						return;
					}
					loginMessage.setKey("loginForm.unexpectedError");
				},
				onSuccess: () => {
					form.reset();
					loginMessage.setKey(null);
					emailMessage.setKey(null);
					passwordMessage.setKey(null);
					navigate({
						to: redirectTo,
					});
				},
			},
		);
	}

	function handleInvalidEmail(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			emailMessage.setKey("loginForm.input.email.required");
			return;
		}

		if (validity.typeMismatch) {
			emailMessage.setKey("loginForm.input.email.invalid");
			return;
		}

		if (validity.tooShort) {
			emailMessage.setKey("loginForm.input.email.tooShort");
			return;
		}
	}

	function handleInvalidPassword(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			passwordMessage.setKey("loginForm.input.password.required");
		}
	}

	return (
		<form onSubmit={handleSubmit} className={styles()}>
			<p className="min-h-12 text-danger">
				{loginMessage.key && t(loginMessage.key)}
			</p>
			<TextInput
				name={EMAIL_INPUT_NAME}
				label={t("loginForm.input.email.label")}
				placeholder={t("loginForm.input.email.placeholder")}
				type="email"
				onChange={() => emailMessage.setKey(null)}
				onInvalid={handleInvalidEmail}
				message={emailMessage.key ? t(emailMessage.key) : undefined}
				isError={!!emailMessage.key}
				minLength={5}
				required
			/>
			<TextInput
				name={PASSWORD_INPUT_NAME}
				label={t("loginForm.input.password.label")}
				placeholder={t("loginForm.input.password.placeholder")}
				type="password"
				onChange={() => passwordMessage.setKey(null)}
				onInvalid={handleInvalidPassword}
				message={passwordMessage.key ? t(passwordMessage.key) : undefined}
				isError={!!passwordMessage.key}
				required
			/>
			<Button type="submit" disabled={isPending}>
				{t("loginForm.submitButton")}
			</Button>
		</form>
	);
}
