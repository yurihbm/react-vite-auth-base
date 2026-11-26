import { createFileRoute } from "@tanstack/react-router";

import {
	OAuthButtons,
	publicOnlyRouteBeforeLoad,
	RegisterForm,
	safeRedirect,
} from "@modules/auth";

export const Route = createFileRoute("/(auth)/register")({
	component: RouteComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
	validateSearch: (search) => {
		return { redirect: safeRedirect(search.redirect) };
	},
});

const { useSearch } = Route;

function RouteComponent() {
	const search = useSearch();

	return (
		<div className="mx-auto flex w-full flex-col gap-4 sm:max-w-sm">
			<RegisterForm redirectTo={search.redirect} />
			<OAuthButtons redirectTo={search.redirect} />
		</div>
	);
}
