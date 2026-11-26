import { createFileRoute } from "@tanstack/react-router";

import { publicOnlyRouteBeforeLoad, ResetPasswordForm } from "@modules/auth";

export const Route = createFileRoute("/(auth)/password/reset")({
	component: ResetPasswordForm,
	beforeLoad: publicOnlyRouteBeforeLoad,
});
