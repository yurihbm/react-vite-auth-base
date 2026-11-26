import { createFileRoute } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { useAuth } from "@modules/auth";

export const Route = createFileRoute("/_authenticated/account/")({
	component: AccountComponent,
});

function AccountComponent() {
	const { user } = useAuth<true>();
	const t = useTranslate("shared");

	return (
		<section className="mx-auto flex max-w-96 flex-col gap-4">
			<h2 className="text-lg font-bold">{t("account.title")}</h2>
			<pre className="overflow-x-auto rounded bg-background-elevated p-2">
				{JSON.stringify(user, null, 2)}
			</pre>
		</section>
	);
}
