import { createFileRoute } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { AuthLayout, RevertConfirm } from "@modules/auth";
import { useRevertEmailChange } from "@modules/users";

export const Route = createFileRoute("/account/email/revert")({
	component: RouteComponent,
	validateSearch: (search): { token?: string } => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
});

const { useSearch } = Route;

function RouteComponent() {
	const { token } = useSearch();
	const t = useTranslate("auth");
	const {
		mutate: revert,
		isPending,
		isSuccess,
		error,
	} = useRevertEmailChange();

	return (
		<AuthLayout title={t("revertEmailChange.title")}>
			<RevertConfirm
				description={t("revertEmailChange.description")}
				confirmLabel={t("revertEmailChange.confirmButton")}
				successMessage={t("revertEmailChange.success")}
				onConfirm={() => token && revert({ token })}
				isPending={isPending}
				isSuccess={isSuccess}
				isDisabled={!token}
				error={error}
			/>
		</AuthLayout>
	);
}
