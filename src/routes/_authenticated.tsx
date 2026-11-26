import { createFileRoute, Outlet } from "@tanstack/react-router";

import { privateRouteBeforeLoad } from "@modules/auth";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: privateRouteBeforeLoad,
	component: Outlet,
});
