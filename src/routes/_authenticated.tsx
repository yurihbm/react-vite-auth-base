import { createFileRoute } from "@tanstack/react-router";

import { PrivateOutlet, privateRouteBeforeLoad } from "@modules/auth";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: privateRouteBeforeLoad,
	component: PrivateOutlet,
});
