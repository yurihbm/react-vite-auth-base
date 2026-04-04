import { createFileRoute } from "@tanstack/react-router";

import { LoginForm, publicOnlyRouteBeforeLoad } from "@src/modules/auth";

export const Route = createFileRoute("/(auth)/login")({
	component: LoginComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
});

function LoginComponent() {
	return <LoginForm />;
}
