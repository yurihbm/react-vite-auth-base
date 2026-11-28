import type { User } from "@modules/users/types";
import type { SubmitEvent } from "react";

import { APIError, useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Alert, Button, InlineError, TextInput } from "@lib/ui";
import { StepUpCancelledError } from "@modules/auth/providers/step-up/context";
import { base } from "@modules/users/components/styles";
import { useUpdateUser } from "@modules/users/services";

const NAME_INPUT_NAME = "name";

interface EditNameFormProps {
	user: User;
}

/** EditNameForm changes the name of `user`. */
export function EditNameForm({ user }: EditNameFormProps) {
	const t = useTranslate("users");

	const { mutate: updateUser, isPending, isSuccess, error } = useUpdateUser();
	const apiErrorMessage = useApiErrorMessage(error);
	const fieldError =
		error instanceof APIError ? error.details?.[NAME_INPUT_NAME] : undefined;

	function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		updateUser({
			uuid: user.uuid,
			name: String(formData.get(NAME_INPUT_NAME)),
		});
	}

	return (
		<form onSubmit={handleSubmit} className={base()}>
			{isSuccess && (
				<Alert color="success" description={t("editNameForm.success")} />
			)}
			{!!error && !(error instanceof StepUpCancelledError) && (
				<InlineError>{apiErrorMessage}</InlineError>
			)}
			<TextInput
				name={NAME_INPUT_NAME}
				label={t("editNameForm.input.name.label")}
				placeholder={t("editNameForm.input.name.placeholder")}
				defaultValue={user.name}
				message={fieldError}
				isError={!!fieldError}
				minLength={3}
				maxLength={100}
				required
			/>
			<Button type="submit" disabled={isPending} className="self-end">
				{t("editNameForm.submitButton")}
			</Button>
		</form>
	);
}
