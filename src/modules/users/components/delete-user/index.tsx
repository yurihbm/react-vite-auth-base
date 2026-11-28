import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Button, Dialog, InlineError } from "@lib/ui";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { base } from "@modules/users/components/styles";
import {
	getUserKey,
	listUsersKey,
	useDeleteUser,
} from "@modules/users/services";

interface DeleteUserProps {
	/** The UUID of the user to delete. */
	uuid: string;
	/** Called after the user is deleted. */
	onDeleted: () => void;
}

/**
 * DeleteUser lets an admin delete another user after a confirmation and a
 * step-up. For the signed-in user's own account use `DeleteAccount`.
 */
export function DeleteUser({ uuid, onDeleted }: DeleteUserProps) {
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
					queryClient.invalidateQueries({ queryKey: [listUsersKey] });
					// Removed, not invalidated: a refetch would only 404.
					queryClient.removeQueries({ queryKey: [getUserKey, uuid] });
					onDeleted();
				},
			},
		);
	}

	return (
		<div className={base()}>
			<p>{t("deleteUser.description")}</p>
			<Button color="danger" onClick={() => setOpen(true)}>
				{t("deleteUser.button")}
			</Button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				title={t("deleteUser.confirm.title")}
				description={t("deleteUser.confirm.description")}
				size="sm"
				footer={
					<>
						<Button variant="outline" onClick={() => setOpen(false)}>
							{t("deleteUser.confirm.cancelButton")}
						</Button>
						<Button color="danger" disabled={isPending} onClick={handleConfirm}>
							{t("deleteUser.confirm.confirmButton")}
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
