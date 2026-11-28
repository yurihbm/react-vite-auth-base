import { createFileRoute } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { AuthLayout, RevertConfirm, useRevertOAuthLink } from "@modules/auth";

export const Route = createFileRoute("/account/oauth/revert")({
	component: RouteComponent,
	validateSearch: (search): { token?: string } => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
});

const { useSearch } = Route;

function RouteComponent() {
	const { token } = useSearch();
	const t = useTranslate("auth");
	const { mutate: revert, isPending, isSuccess, error } = useRevertOAuthLink();

	return (
		<AuthLayout title={t("revertOAuthLink.title")}>
			<RevertConfirm
				description={t("revertOAuthLink.description")}
				confirmLabel={t("revertOAuthLink.confirmButton")}
				successMessage={t("revertOAuthLink.success")}
				onConfirm={() => token && revert({ token })}
				isPending={isPending}
				isSuccess={isSuccess}
				isLinkInvalid={!token}
				error={error}
			/>
		</AuthLayout>
	);
}
