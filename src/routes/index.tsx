import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

import { useAccessDeniedNotice } from "@modules/auth";
import { HomePage } from "@modules/home";

export const Route = createFileRoute("/")({
	component: IndexComponent,
	validateSearch: (search): { reason?: "forbidden" } => ({
		reason: search.reason === "forbidden" ? "forbidden" : undefined,
	}),
});

const { useNavigate, useSearch } = Route;

function IndexComponent() {
	const { reason } = useSearch();
	const navigate = useNavigate();
	const clearReason = useCallback(
		() => navigate({ search: {}, replace: true }),
		[navigate],
	);

	useAccessDeniedNotice(reason === "forbidden", clearReason);

	return <HomePage />;
}
