import { createFileRoute } from "@tanstack/react-router";

import { publicOnlyRouteBeforeLoad } from "@src/modules/auth";

export const Route = createFileRoute("/(auth)/register")({
	component: RouteComponent,
	beforeLoad: publicOnlyRouteBeforeLoad,
});

function RouteComponent() {
	return <div>Hello "/(auth)/register"!</div>;
}
