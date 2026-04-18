import { createFileRoute } from "@tanstack/react-router";

import { publicOnlyRouteBeforeLoad, RegisterForm } from "@src/modules/auth";

export const Route = createFileRoute("/(auth)/register")({
	component: RouteComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
	validateSearch: (search) => {
		const redirect = search.redirect ? String(search.redirect) : "/";
		return { redirect };
	},
});

const { useSearch } = Route;

function RouteComponent() {
	const search = useSearch();

	return <RegisterForm redirectTo={search.redirect} />;
}
