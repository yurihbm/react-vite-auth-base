import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireRoleBeforeLoad } from "@modules/auth";

export const Route = createFileRoute("/_authenticated/_admin")({
	beforeLoad: requireRoleBeforeLoad("admin"),
	component: Outlet,
});
