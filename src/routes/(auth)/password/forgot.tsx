import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordForm, publicOnlyRouteBeforeLoad } from "@modules/auth";

export const Route = createFileRoute("/(auth)/password/forgot")({
	component: ForgotPasswordForm,
	beforeLoad: publicOnlyRouteBeforeLoad,
});
