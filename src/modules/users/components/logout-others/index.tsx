import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Alert, Button } from "@lib/ui";
import { useLogoutOthers } from "@modules/auth/services/logout-others";
import { base, errorMessage } from "@modules/users/components/styles";

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
			<p>{t("logoutOthers.description")}</p>
			{isSuccess && (
				<Alert type="success" description={t("logoutOthers.success")} />
			)}
			{!!error && <p className={errorMessage()}>{apiErrorMessage}</p>}
			<Button
				color="secondary"
				disabled={isPending}
				onClick={() => logoutOthers()}
			>
				{t("logoutOthers.button")}
			</Button>
		</div>
	);
}
