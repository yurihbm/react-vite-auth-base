import type { SubmitEvent, SyntheticEvent } from "react";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate, useTranslateKeyState } from "@lib/i18n";
import { Button, TextInput } from "@lib/ui";
import { base, errorMessage } from "@modules/auth/components/login-form/styles";
import { ResendButton } from "@modules/auth/components/resend-button";
import { useCooldown } from "@modules/auth/hooks";
import { useVerifySignup } from "@modules/auth/services";

const CODE_INPUT_NAME = "code";
const CODE_LENGTH = 6;

interface VerifyCodeFormProps {
	redirectTo?: string;
	/** Called once the code is verified, before navigating to `redirectTo`. */
	onVerified?: () => void;
}

/**
 * VerifyCodeForm collects the 6-digit code emailed for a pending sign-up
 * (credentials or OAuth) and, once verified, opens `redirectTo` logged in.
 */
export function VerifyCodeForm({
	redirectTo = "/",
	onVerified,
}: VerifyCodeFormProps) {
	const navigate = useNavigate();

	const t = useTranslate("auth");
	const codeMessage = useTranslateKeyState("auth");

	const [apiError, setApiError] = useState<APIError | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const apiErrorMessage = useApiErrorMessage(apiError);
	const verifyMessage = useTranslateKeyState("auth");
	const cooldown = useCooldown(apiError);

	const { mutate: verify, isPending } = useVerifySignup();

	function clearFieldError(name: string) {
		setFieldErrors(({ [name]: _removed, ...rest }) => rest);
	}

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		verify(
			{ code: String(formData.get(CODE_INPUT_NAME)) },
			{
				onError: (error) => {
					if (error instanceof APIError) {
						verifyMessage.setKey(null);
						setApiError(error);
						setFieldErrors(error.details ?? {});
						return;
					}
					setApiError(null);
					setFieldErrors({});
					verifyMessage.setKey("verifyCodeForm.unexpectedError");
				},
				onSuccess: () => {
					onVerified?.();
					navigate({ to: redirectTo });
				},
			},
		);
	}

	function handleInvalidCode(event: SyntheticEvent<HTMLInputElement>) {
		event.preventDefault();
		const { validity } = event.currentTarget;

		if (validity.valueMissing) {
			codeMessage.setKey("verifyCodeForm.input.code.required");
			return;
		}

		if (validity.patternMismatch || validity.tooShort) {
			codeMessage.setKey("verifyCodeForm.input.code.invalid");
			return;
		}
	}

	return (
		<div className={base()}>
			<p>{t("verifyCodeForm.description")}</p>
			<form onSubmit={handleSubmit} className={base()}>
				<p className={errorMessage()}>
					{apiError
						? apiErrorMessage
						: verifyMessage.key && t(verifyMessage.key)}
				</p>
				<TextInput
					name={CODE_INPUT_NAME}
					label={t("verifyCodeForm.input.code.label")}
					placeholder={t("verifyCodeForm.input.code.placeholder")}
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
				<Button type="submit" disabled={isPending || cooldown.remaining > 0}>
					{t("verifyCodeForm.submitButton")}
				</Button>
			</form>
			<ResendButton />
		</div>
	);
}
