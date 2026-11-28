import type { SubmitEvent, SyntheticEvent } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate, useTranslateKeyState } from "@lib/i18n";
import { Alert, Button, TextInput, useFocusFirstInvalid } from "@lib/ui";
import { useCooldown } from "@modules/auth/hooks";
import { useRegister } from "@modules/auth/services";

import { base } from "./styles";

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

	const [apiError, setApiError] = useState<APIError | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const { ref: formRef, focusFirstInvalid } =
		useFocusFirstInvalid<HTMLFormElement>();
	const apiErrorMessage = useApiErrorMessage(apiError);
	const cooldown = useCooldown(apiError);

	const { mutate: register, isPending } = useRegister();

	const formError = apiError
		? apiErrorMessage
		: registerMessage.key && t(registerMessage.key);

	function clearFieldError(name: string) {
		setFieldErrors(({ [name]: _removed, ...rest }) => rest);
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const form = event.currentTarget;
		const formData = new FormData(form);

		register(
			{
				email: String(formData.get(EMAIL_INPUT_NAME)),
				name: String(formData.get(NAME_INPUT_NAME)),
				password: String(formData.get(PASSWORD_INPUT_NAME)),
			},
			{
				onError: (error) => {
					if (error instanceof APIError) {
						registerMessage.setKey(null);
						setApiError(error);
						setFieldErrors(error.details ?? {});
						focusFirstInvalid();
						return;
					}
					setApiError(null);
					setFieldErrors({});
					registerMessage.setKey("registerForm.unexpectedError");
				},
				onSuccess: () => {
					// The sign-up is only pending: the emailed code must be verified
					// before the user is logged in.
					form.reset();
					setApiError(null);
					setFieldErrors({});
					registerMessage.setKey(null);
					emailMessage.setKey(null);
					nameMessage.setKey(null);
					passwordMessage.setKey(null);
					navigate({
						to: "/register/verify",
						search: { redirect: redirectTo },
					});
				},
			},
		);
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
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			onInvalidCapture={focusFirstInvalid}
			className={base()}
		>
			{formError && <Alert color="danger" description={formError} />}
			<TextInput
				name={EMAIL_INPUT_NAME}
				label={t("registerForm.input.email.label")}
				placeholder={t("registerForm.input.email.placeholder")}
				type="email"
				onChange={() => {
					emailMessage.setKey(null);
					clearFieldError(EMAIL_INPUT_NAME);
				}}
				onInvalid={handleInvalidEmail}
				message={
					emailMessage.key ? t(emailMessage.key) : fieldErrors[EMAIL_INPUT_NAME]
				}
				isError={!!emailMessage.key || !!fieldErrors[EMAIL_INPUT_NAME]}
				minLength={5}
				required
			/>
			<TextInput
				name={NAME_INPUT_NAME}
				label={t("registerForm.input.name.label")}
				placeholder={t("registerForm.input.name.placeholder")}
				type="text"
				onChange={() => {
					nameMessage.setKey(null);
					clearFieldError(NAME_INPUT_NAME);
				}}
				onInvalid={handleInvalidName}
				message={
					nameMessage.key ? t(nameMessage.key) : fieldErrors[NAME_INPUT_NAME]
				}
				isError={!!nameMessage.key || !!fieldErrors[NAME_INPUT_NAME]}
				minLength={2}
				required
			/>
			<TextInput
				name={PASSWORD_INPUT_NAME}
				label={t("registerForm.input.password.label")}
				placeholder={t("registerForm.input.password.placeholder")}
				type="password"
				onChange={() => {
					passwordMessage.setKey(null);
					clearFieldError(PASSWORD_INPUT_NAME);
				}}
				onInvalid={handleInvalidPassword}
				message={
					passwordMessage.key
						? t(passwordMessage.key)
						: fieldErrors[PASSWORD_INPUT_NAME]
				}
				isError={!!passwordMessage.key || !!fieldErrors[PASSWORD_INPUT_NAME]}
				minLength={8}
				required
			/>
			<Button type="submit" disabled={isPending || cooldown.remaining > 0}>
				{t("registerForm.submitButton")}
			</Button>
		</form>
	);
}
