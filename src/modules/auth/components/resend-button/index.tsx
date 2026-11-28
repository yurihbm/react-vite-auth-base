import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Button } from "@lib/ui";
import { errorMessage } from "@modules/auth/components/login-form/styles";
import { useCooldown } from "@modules/auth/hooks";
import { useResendSignup } from "@modules/auth/services";

/**
 * ResendButton asks the API to email a new sign-up code. It stays disabled for
 * a cooldown afterwards: the API's `Retry-After` when it rate limits, 60
 * seconds otherwise.
 */
export function ResendButton() {
	const t = useTranslate("auth");

	const { mutate: resend, isPending, error } = useResendSignup();
	const apiErrorMessage = useApiErrorMessage(error);
	const cooldown = useCooldown(error);

	return (
		<>
			{error && <p className={errorMessage()}>{apiErrorMessage}</p>}
			<Button
				color="secondary"
				disabled={isPending || cooldown.remaining > 0}
				onClick={() => resend(undefined, { onSuccess: () => cooldown.start() })}
			>
				{cooldown.remaining > 0
					? t("resendButton.cooldown", { seconds: cooldown.remaining })
					: t("resendButton.label")}
			</Button>
		</>
	);
}
