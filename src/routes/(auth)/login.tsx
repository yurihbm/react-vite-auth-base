import { createFileRoute } from "@tanstack/react-router";

import { LoginForm } from "@src/modules/auth";

export const Route = createFileRoute("/(auth)/login")({
	component: LoginComponent,
});

function LoginComponent() {
	return <LoginForm />;
}
