import type { SubmitEvent } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Alert, Button, TextInput } from "@lib/ui";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { base, errorMessage } from "@modules/users/components/styles";
import { useChangePassword } from "@modules/users/services";

const PASSWORD_INPUT_NAME = "password";

/**
 * ChangePasswordForm sets a new password. It asks for a step-up first, and the
 * API signs out the other devices.
 */
export function ChangePasswordForm() {
	const t = useTranslate("users");

	const {
		mutate: changePassword,
		isPending,
		isSuccess,
		error,
	} = useChangePassword();
	const apiErrorMessage = useApiErrorMessage(error);
	const fieldError =
		error instanceof APIError ? error.details?.new_password : undefined;

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const form = event.currentTarget;
		const formData = new FormData(form);

		changePassword(
			{ newPassword: String(formData.get(PASSWORD_INPUT_NAME)) },
			{ onSuccess: () => form.reset() },
		);
	}

	return (
		<form onSubmit={handleSubmit} className={base()}>
			<p>{t("changePasswordForm.description")}</p>
			{isSuccess && (
				<Alert color="success" description={t("changePasswordForm.success")} />
			)}
			{!!error && !(error instanceof StepUpCancelledError) && (
				<p className={errorMessage()}>{apiErrorMessage}</p>
			)}
			<TextInput
				name={PASSWORD_INPUT_NAME}
				type="password"
				label={t("changePasswordForm.input.password.label")}
				placeholder={t("changePasswordForm.input.password.placeholder")}
				autoComplete="new-password"
				message={fieldError}
				isError={!!fieldError}
				minLength={8}
				maxLength={64}
				required
			/>
			<Button type="submit" disabled={isPending}>
				{t("changePasswordForm.submitButton")}
			</Button>
		</form>
	);
}
