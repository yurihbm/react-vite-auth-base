import type { SubmitEvent, SyntheticEvent } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate, useTranslateKeyState } from "@lib/i18n";
import { Alert, Button, TextInput } from "@lib/ui";
import { base } from "@modules/auth/components/login-form/styles";
import { useCooldown } from "@modules/auth/hooks";
import { useForgotPassword } from "@modules/auth/services";

const EMAIL_INPUT_NAME = "email";

/**
 * ForgotPasswordForm requests a password reset code by email and then moves on
 * to the reset page. The API answers the same for unknown addresses, so the
 * outcome never reveals whether an account exists.
 */
export function ForgotPasswordForm() {
	const navigate = useNavigate();

	const t = useTranslate("auth");
	const emailMessage = useTranslateKeyState("auth");
	const forgotMessage = useTranslateKeyState("auth");

	const [apiError, setApiError] = useState<APIError | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const apiErrorMessage = useApiErrorMessage(apiError);
	const cooldown = useCooldown(apiError);

	const { mutate: forgotPassword, isPending } = useForgotPassword();

	const formError = apiError
		? apiErrorMessage
		: forgotMessage.key && t(forgotMessage.key);

	function clearFieldError(name: string) {
		setFieldErrors(({ [name]: _removed, ...rest }) => rest);
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		forgotPassword(
			{ email: String(formData.get(EMAIL_INPUT_NAME)) },
			{
				onError: (error) => {
					if (error instanceof APIError) {
						forgotMessage.setKey(null);
						setApiError(error);
						setFieldErrors(error.details ?? {});
						return;
					}
					setApiError(null);
					setFieldErrors({});
					forgotMessage.setKey("forgotPasswordForm.unexpectedError");
				},
				onSuccess: () => {
					navigate({ to: "/password/reset" });
				},
			},
		);
	}

	function handleInvalidEmail(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			emailMessage.setKey("forgotPasswordForm.input.email.required");
			return;
		}

		if (validity.typeMismatch) {
			emailMessage.setKey("forgotPasswordForm.input.email.invalid");
			return;
		}
	}

	return (
		<form onSubmit={handleSubmit} className={base()}>
			{formError && <Alert color="danger" description={formError} />}
			<TextInput
				name={EMAIL_INPUT_NAME}
				label={t("forgotPasswordForm.input.email.label")}
				placeholder={t("forgotPasswordForm.input.email.placeholder")}
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
				required
			/>
			<Button type="submit" disabled={isPending || cooldown.remaining > 0}>
				{t("forgotPasswordForm.submitButton")}
			</Button>
		</form>
	);
}
