import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Alert, Button, InlineError } from "@lib/ui";
import { useLogoutOthers } from "@modules/auth/services/logout-others";
import { base } from "@modules/users/components/styles";

/** LogoutOthers ends every session of the user except the current one. */
export function LogoutOthers() {
	const t = useTranslate("users");

	const {
		mutate: logoutOthers,
		isPending,
		isSuccess,
		error,
	} = useLogoutOthers();
	const apiErrorMessage = useApiErrorMessage(error);

	return (
		<div className={base()}>
			{isSuccess && (
				<Alert color="success" description={t("logoutOthers.success")} />
			)}
			{!!error && <InlineError>{apiErrorMessage}</InlineError>}
			<Button
				variant="outline"
				className="self-end"
				disabled={isPending}
				onClick={() => logoutOthers()}
			>
				{t("logoutOthers.button")}
			</Button>
		</div>
	);
}
