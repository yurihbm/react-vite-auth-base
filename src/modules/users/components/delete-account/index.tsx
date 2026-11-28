import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Button, Dialog, InlineError } from "@lib/ui";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { base } from "@modules/users/components/styles";
import { useDeleteUser } from "@modules/users/services";

interface DeleteAccountProps {
	/** The UUID of the account to delete. */
	uuid: string;
}

/**
 * DeleteAccount deletes the user's own account after a confirmation and a
 * step-up. The API clears the auth cookies, so it also drops the local state
 * and goes home.
 */
export function DeleteAccount({ uuid }: DeleteAccountProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const t = useTranslate("users");

	const [open, setOpen] = useState(false);

	const { mutate: deleteUser, isPending, error } = useDeleteUser();
	const apiErrorMessage = useApiErrorMessage(error);

	function handleConfirm() {
		deleteUser(
			{ uuid },
			{
				onSuccess: () => {
					queryClient.removeQueries();
					navigate({ to: "/" });
				},
			},
		);
	}

	return (
		<div className={base()}>
			<p>{t("deleteAccount.description")}</p>
			<Button color="danger" onClick={() => setOpen(true)}>
				{t("deleteAccount.button")}
			</Button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				title={t("deleteAccount.confirm.title")}
				description={t("deleteAccount.confirm.description")}
				size="sm"
				footer={
					<>
						<Button variant="outline" onClick={() => setOpen(false)}>
							{t("deleteAccount.confirm.cancelButton")}
						</Button>
						<Button color="danger" disabled={isPending} onClick={handleConfirm}>
							{t("deleteAccount.confirm.confirmButton")}
						</Button>
					</>
				}
			>
				{!!error && !(error instanceof StepUpCancelledError) && (
					<InlineError>{apiErrorMessage}</InlineError>
				)}
			</Dialog>
		</div>
	);
}
