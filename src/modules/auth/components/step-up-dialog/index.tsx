import type { SubmitEvent } from "react";

import { useState } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Button, Dialog, InlineError, TextInput } from "@lib/ui";
import { base } from "@modules/auth/components/login-form/styles";

const CODE_INPUT_NAME = "code";
const CODE_LENGTH = 6;
/** The code was already sent, so entering it is still the next step. */
const COOLDOWN_KEY = "auth.stepUp.cooldown";
const USER_LOCKED_KEY = "auth.stepUp.userLocked";

interface StepUpDialogProps {
	open: boolean;
	/** Whether the code is being emailed. */
	isSending: boolean;
	/** Whether the entered code is being checked. */
	isVerifying: boolean;
	/** The error of the last attempt to email the code. */
	sendError?: unknown;
	/** The error of the last attempt to check the code. */
	verifyError?: unknown;
	/** Seconds left until the code can be sent again. */
	resendIn: number;
	onSubmit: (code: string) => void;
	onResend: () => void;
	onCancel: () => void;
}

/**
 * StepUpDialog asks for the 6-digit code emailed to confirm a sensitive action.
 * It only renders state: `StepUpProvider` drives the requests.
 */
export function StepUpDialog({
	open,
	isSending,
	isVerifying,
	sendError,
	verifyError,
	resendIn,
	onSubmit,
	onResend,
	onCancel,
}: StepUpDialogProps) {
	const t = useTranslate("auth");

	const [codeChanged, setCodeChanged] = useState(false);
	const [handledError, setHandledError] = useState(verifyError);

	// A new verify error invalidates what the user typed, so its field details
	// show again.
	if (verifyError !== handledError) {
		setHandledError(verifyError);
		setCodeChanged(false);
	}

	const shownSendError =
		sendError instanceof APIError && sendError.key === COOLDOWN_KEY
			? null
			: sendError;
	const error = verifyError ?? shownSendError;
	const errorText = useApiErrorMessage(error);
	const isLocked = [sendError, verifyError].some(
		(value) => value instanceof APIError && value.key === USER_LOCKED_KEY,
	);
	const codeDetail =
		!codeChanged && verifyError instanceof APIError
			? verifyError.details?.[CODE_INPUT_NAME]
			: undefined;

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		onSubmit(String(formData.get(CODE_INPUT_NAME)));
	}

	return (
		<Dialog
			open={open}
			onClose={onCancel}
			title={t("stepUpDialog.title")}
			description={t("stepUpDialog.description")}
			size="sm"
		>
			<div className={base()}>
				{!!error && <InlineError>{errorText}</InlineError>}
				{!isLocked && (
					<>
						<form onSubmit={handleSubmit} className={base()}>
							<TextInput
								name={CODE_INPUT_NAME}
								label={t("stepUpDialog.input.code.label")}
								placeholder={t("stepUpDialog.input.code.placeholder")}
								inputMode="numeric"
								autoComplete="one-time-code"
								maxLength={CODE_LENGTH}
								minLength={CODE_LENGTH}
								pattern="[0-9]{6}"
								onChange={() => setCodeChanged(true)}
								message={codeDetail}
								isError={!!codeDetail}
								required
							/>
							<Button type="submit" disabled={isVerifying}>
								{t("stepUpDialog.submitButton")}
							</Button>
						</form>
						<Button
							color="secondary"
							disabled={isSending || resendIn > 0}
							onClick={onResend}
						>
							{resendIn > 0
								? t("resendButton.cooldown", { seconds: resendIn })
								: t("resendButton.label")}
						</Button>
					</>
				)}
			</div>
		</Dialog>
	);
}
