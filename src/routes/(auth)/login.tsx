import { createFileRoute } from "@tanstack/react-router";

import { LoginForm, publicOnlyRouteBeforeLoad } from "@src/modules/auth";

export const Route = createFileRoute("/(auth)/login")({
	component: LoginComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
	validateSearch: (search) => {
		const redirect = search.redirect ? String(search.redirect) : "/";
		return { redirect };
	},
});

const { useSearch } = Route;

function LoginComponent() {
	const search = useSearch();

	return <LoginForm redirectTo={search.redirect} />;
}
