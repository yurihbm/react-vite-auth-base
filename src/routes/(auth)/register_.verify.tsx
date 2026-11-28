import { createFileRoute } from "@tanstack/react-router";

import {
	publicOnlyRouteBeforeLoad,
	safeRedirect,
	VerifyCodeForm,
} from "@modules/auth";

export const Route = createFileRoute("/(auth)/register_/verify")({
	component: RouteComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
	validateSearch: (search) => {
		return { redirect: safeRedirect(search.redirect) };
	},
});

const { useSearch } = Route;

function RouteComponent() {
	const search = useSearch();

	return <VerifyCodeForm redirectTo={search.redirect} />;
}
