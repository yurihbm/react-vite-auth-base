import type { SubmitEvent } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Button, TextInput } from "@lib/ui";
import { useCooldown } from "@modules/auth/hooks/use-cooldown";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { base, errorMessage } from "@modules/users/components/styles";
import {
	useConfirmEmailChange,
	useRequestEmailChange,
} from "@modules/users/services";

const EMAIL_INPUT_NAME = "email";
const CODE_INPUT_NAME = "code";
const CODE_LENGTH = 6;

/**
 * ChangeEmailForm changes the email in two steps: it asks for the new address
 * (after a step-up) and then for the code emailed to it. The API signs the user
 * out of every device on success, so it sends them to the login page.
 */
export function ChangeEmailForm() {
	const navigate = useNavigate();
	const t = useTranslate("users");

	const [isRequested, setIsRequested] = useState(false);

	const request = useRequestEmailChange();
	const confirm = useConfirmEmailChange();
	const requestCooldown = useCooldown(request.error);
	const confirmCooldown = useCooldown(confirm.error);
	const requestErrorMessage = useApiErrorMessage(request.error);
	const confirmErrorMessage = useApiErrorMessage(confirm.error);

	const error = isRequested ? confirm.error : request.error;
	const errorText = isRequested ? confirmErrorMessage : requestErrorMessage;
	const inputName = isRequested ? CODE_INPUT_NAME : EMAIL_INPUT_NAME;
	const fieldError =
		error instanceof APIError ? error.details?.[inputName] : undefined;

	function handleRequest(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		request.mutate(
			{ email: String(formData.get(EMAIL_INPUT_NAME)) },
			{ onSuccess: () => setIsRequested(true) },
		);
	}

	function handleConfirm(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		confirm.mutate(
			{ code: String(formData.get(CODE_INPUT_NAME)) },
			{
				onSuccess: () =>
					navigate({
						to: "/login",
						search: { redirect: "/", reason: "emailChanged" },
					}),
			},
		);
	}

	return (
		<form
			onSubmit={isRequested ? handleConfirm : handleRequest}
			className={base()}
		>
			<p>
				{isRequested
					? t("changeEmailForm.codeDescription")
					: t("changeEmailForm.description")}
			</p>
			{!!error && !(error instanceof StepUpCancelledError) && (
				<p className={errorMessage()}>{errorText}</p>
			)}
			{isRequested ? (
				<>
					<TextInput
						name={CODE_INPUT_NAME}
						label={t("changeEmailForm.input.code.label")}
						placeholder={t("changeEmailForm.input.code.placeholder")}
						inputMode="numeric"
						autoComplete="one-time-code"
						maxLength={CODE_LENGTH}
						minLength={CODE_LENGTH}
						pattern="[0-9]{6}"
						message={fieldError}
						isError={!!fieldError}
						required
					/>
					<Button
						type="submit"
						disabled={confirm.isPending || confirmCooldown.remaining > 0}
					>
						{t("changeEmailForm.confirmButton")}
					</Button>
				</>
			) : (
				<>
					<TextInput
						name={EMAIL_INPUT_NAME}
						type="email"
						label={t("changeEmailForm.input.email.label")}
						placeholder={t("changeEmailForm.input.email.placeholder")}
						autoComplete="email"
						message={fieldError}
						isError={!!fieldError}
						required
					/>
					<Button
						type="submit"
						disabled={request.isPending || requestCooldown.remaining > 0}
					>
						{t("changeEmailForm.requestButton")}
					</Button>
				</>
			)}
		</form>
	);
}
