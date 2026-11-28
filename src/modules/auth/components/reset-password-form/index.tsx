import type { SubmitEvent, SyntheticEvent } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate, useTranslateKeyState } from "@lib/i18n";
import { Alert, Button, TextInput } from "@lib/ui";
import { base } from "@modules/auth/components/login-form/styles";
import { useCooldown } from "@modules/auth/hooks";
import { useResetPassword } from "@modules/auth/services";

const CODE_INPUT_NAME = "code";
const PASSWORD_INPUT_NAME = "password";
const CODE_LENGTH = 6;

/**
 * ResetPasswordForm sets a new password with the code emailed by the forgot
 * password step. The API does not log the user in, so it sends them to the
 * login page afterwards.
 */
export function ResetPasswordForm() {
	const navigate = useNavigate();

	const t = useTranslate("auth");
	const codeMessage = useTranslateKeyState("auth");
	const passwordMessage = useTranslateKeyState("auth");
	const resetMessage = useTranslateKeyState("auth");

	const [apiError, setApiError] = useState<APIError | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const apiErrorMessage = useApiErrorMessage(apiError);
	const cooldown = useCooldown(apiError);

	const { mutate: resetPassword, isPending } = useResetPassword();

	const formError = apiError
		? apiErrorMessage
		: resetMessage.key && t(resetMessage.key);

	function clearFieldError(name: string) {
		setFieldErrors(({ [name]: _removed, ...rest }) => rest);
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		resetPassword(
			{
				code: String(formData.get(CODE_INPUT_NAME)),
				password: String(formData.get(PASSWORD_INPUT_NAME)),
			},
			{
				onError: (error) => {
					if (error instanceof APIError) {
						resetMessage.setKey(null);
						setApiError(error);
						setFieldErrors(error.details ?? {});
						return;
					}
					setApiError(null);
					setFieldErrors({});
					resetMessage.setKey("resetPasswordForm.unexpectedError");
				},
				onSuccess: () => {
					navigate({
						to: "/login",
						search: { redirect: "/", reason: "passwordReset" },
					});
				},
			},
		);
	}

	function handleInvalidCode(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			codeMessage.setKey("resetPasswordForm.input.code.required");
			return;
		}

		if (validity.patternMismatch || validity.tooShort) {
			codeMessage.setKey("resetPasswordForm.input.code.invalid");
			return;
		}
	}

	function handleInvalidPassword(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			passwordMessage.setKey("resetPasswordForm.input.password.required");
			return;
		}

		if (validity.tooShort) {
			passwordMessage.setKey("resetPasswordForm.input.password.tooShort");
			return;
		}
	}

	return (
		<form onSubmit={handleSubmit} className={base()}>
			{formError && <Alert color="danger" description={formError} />}
			<TextInput
				name={CODE_INPUT_NAME}
				label={t("resetPasswordForm.input.code.label")}
				placeholder={t("resetPasswordForm.input.code.placeholder")}
				inputMode="numeric"
				autoComplete="one-time-code"
				maxLength={CODE_LENGTH}
				minLength={CODE_LENGTH}
				pattern="[0-9]{6}"
				onChange={() => {
					codeMessage.setKey(null);
					clearFieldError(CODE_INPUT_NAME);
				}}
				onInvalid={handleInvalidCode}
				message={
					codeMessage.key ? t(codeMessage.key) : fieldErrors[CODE_INPUT_NAME]
				}
				isError={!!codeMessage.key || !!fieldErrors[CODE_INPUT_NAME]}
				required
			/>
			<TextInput
				name={PASSWORD_INPUT_NAME}
				label={t("resetPasswordForm.input.password.label")}
				placeholder={t("resetPasswordForm.input.password.placeholder")}
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
				maxLength={64}
				required
			/>
			<Button type="submit" disabled={isPending || cooldown.remaining > 0}>
				{t("resetPasswordForm.submitButton")}
			</Button>
		</form>
	);
}
