import type { TranslateKey } from "@src/lib/i18n";
import type { SubmitEvent, SyntheticEvent } from "react";

import { useNavigate } from "@tanstack/react-router";

import { APIError } from "@src/lib/api";
import { useTranslate, useTranslateKeyState } from "@src/lib/i18n";
import { Button, TextInput } from "@src/modules/shared";

import { useLogin, useRegister } from "../../services";
import { base, errorMessage } from "./styles";

const EMAIL_INPUT_NAME = "email";
const NAME_INPUT_NAME = "name";
const PASSWORD_INPUT_NAME = "password";

interface RegisterFormProps {
	redirectTo?: string;
}

/**
 * RegisterForm component is responsible for rendering the register form and
 * handling its submission.
 */
export function RegisterForm({ redirectTo = "/" }: RegisterFormProps) {
	const navigate = useNavigate();

	const t = useTranslate("auth");
	const emailMessage = useTranslateKeyState("auth");
	const nameMessage = useTranslateKeyState("auth");
	const passwordMessage = useTranslateKeyState("auth");
	const registerMessage = useTranslateKeyState("auth");

	const { mutateAsync: register, isPending: isRegisterPending } = useRegister();
	const { mutateAsync: login, isPending: isLoginPending } = useLogin();

	const isPending = isRegisterPending || isLoginPending;

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const form = event.currentTarget;
		const formData = new FormData(form);

		try {
			const email = String(formData.get(EMAIL_INPUT_NAME));
			const name = String(formData.get(NAME_INPUT_NAME));
			const password = String(formData.get(PASSWORD_INPUT_NAME));

			await register({
				email,
				name,
				password,
			});

			await login({
				email,
				password,
			});

			form.reset();
			registerMessage.setKey(null);
			emailMessage.setKey(null);
			nameMessage.setKey(null);
			passwordMessage.setKey(null);
			navigate({
				to: redirectTo,
			});
		} catch (error) {
			if (error instanceof APIError) {
				// TODO: map API errors to translation keys.
				registerMessage.setKey(error.message as TranslateKey<"auth">);
				return;
			}
			registerMessage.setKey("registerForm.unexpectedError");
		}
	}

	function handleInvalidEmail(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			emailMessage.setKey("registerForm.input.email.required");
			return;
		}

		if (validity.typeMismatch) {
			emailMessage.setKey("registerForm.input.email.invalid");
			return;
		}

		if (validity.tooShort) {
			emailMessage.setKey("registerForm.input.email.tooShort");
			return;
		}
	}

	function handleInvalidName(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			nameMessage.setKey("registerForm.input.name.required");
			return;
		}

		if (validity.tooShort) {
			nameMessage.setKey("registerForm.input.name.tooShort");
			return;
		}
	}

	function handleInvalidPassword(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			passwordMessage.setKey("registerForm.input.password.required");
			return;
		}

		if (validity.tooShort) {
			passwordMessage.setKey("registerForm.input.password.tooShort");
			return;
		}
	}

	return (
		<form onSubmit={handleSubmit} className={base()}>
			<p className={errorMessage()}>
				{registerMessage.key && t(registerMessage.key)}
			</p>
			<TextInput
				name={EMAIL_INPUT_NAME}
				label={t("registerForm.input.email.label")}
				placeholder={t("registerForm.input.email.placeholder")}
				type="email"
				onChange={() => emailMessage.setKey(null)}
				onInvalid={handleInvalidEmail}
				message={emailMessage.key ? t(emailMessage.key) : undefined}
				isError={!!emailMessage.key}
				minLength={5}
				required
			/>
			<TextInput
				name={NAME_INPUT_NAME}
				label={t("registerForm.input.name.label")}
				placeholder={t("registerForm.input.name.placeholder")}
				type="text"
				onChange={() => nameMessage.setKey(null)}
				onInvalid={handleInvalidName}
				message={nameMessage.key ? t(nameMessage.key) : undefined}
				isError={!!nameMessage.key}
				minLength={2}
				required
			/>
			<TextInput
				name={PASSWORD_INPUT_NAME}
				label={t("registerForm.input.password.label")}
				placeholder={t("registerForm.input.password.placeholder")}
				type="password"
				onChange={() => passwordMessage.setKey(null)}
				onInvalid={handleInvalidPassword}
				message={passwordMessage.key ? t(passwordMessage.key) : undefined}
				isError={!!passwordMessage.key}
				minLength={8}
				required
			/>
			<Button type="submit" disabled={isPending}>
				{t("registerForm.submitButton")}
			</Button>
		</form>
	);
}
