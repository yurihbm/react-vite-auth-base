import type { SubmitEvent, SyntheticEvent } from "react";

import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate, useTranslateKeyState } from "@lib/i18n";
import { Alert, Button, TextInput, useFocusFirstInvalid } from "@lib/ui";
import { useLogin } from "@modules/auth/services";

import { base, forgotPasswordLink } from "./styles";

const EMAIL_INPUT_NAME = "email";
const PASSWORD_INPUT_NAME = "password";

interface LoginFormProps {
	redirectTo?: string;
}

/**
 * LoginForm component is responsible for rendering the login form and handling
 * its submission.
 */
export function LoginForm({ redirectTo = "/" }: LoginFormProps) {
	const navigate = useNavigate();

	const t = useTranslate("auth");
	const emailMessage = useTranslateKeyState("auth");
	const passwordMessage = useTranslateKeyState("auth");
	const loginMessage = useTranslateKeyState("auth");

	const [apiError, setApiError] = useState<APIError | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const { ref: formRef, focusFirstInvalid } =
		useFocusFirstInvalid<HTMLFormElement>();
	const apiErrorMessage = useApiErrorMessage(apiError);

	const { mutate: login, isPending } = useLogin();

	const formError = apiError
		? apiErrorMessage
		: loginMessage.key && t(loginMessage.key);

	function clearFieldError(name: string) {
		setFieldErrors(({ [name]: _removed, ...rest }) => rest);
	}

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
						loginMessage.setKey(null);
						setApiError(error);
						setFieldErrors(error.details ?? {});
						focusFirstInvalid();
						return;
					}
					setApiError(null);
					setFieldErrors({});
					loginMessage.setKey("loginForm.unexpectedError");
				},
				onSuccess: () => {
					form.reset();
					setApiError(null);
					setFieldErrors({});
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
				label={t("loginForm.input.email.label")}
				placeholder={t("loginForm.input.email.placeholder")}
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
				name={PASSWORD_INPUT_NAME}
				label={t("loginForm.input.password.label")}
				labelEnd={
					<Link to="/password/forgot" className={forgotPasswordLink()}>
						{t("loginPage.forgotPassword")}
					</Link>
				}
				placeholder={t("loginForm.input.password.placeholder")}
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
				required
			/>
			<Button type="submit" disabled={isPending}>
				{t("loginForm.submitButton")}
			</Button>
		</form>
	);
}
