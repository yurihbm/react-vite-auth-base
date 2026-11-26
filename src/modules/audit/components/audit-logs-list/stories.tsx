import type { AuditLog } from "@modules/audit/types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { listAuditLogsKey } from "@modules/audit/services";
import { withAuthProviders } from "@modules/auth/components/decorators";

import { AuditLogsList } from ".";

const ACTOR = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

const LOGS: AuditLog[] = Array.from({ length: 200 }, (_, index) => ({
	uuid: `0196a0f0-0000-7000-8000-${String(index).padStart(12, "0")}`,
	actorUuid: ACTOR,
	ipAddress: "127.0.0.1",
	userAgent: "storybook",
	action: index % 3 === 0 ? "LOGIN" : "USER_UPDATE",
	resourceType: "user",
	resourceUuid: ACTOR,
	requestUuid: "0196a0f0-0000-7000-8000-0000000000aa",
	status: index % 4 === 0 ? "FAILURE" : "SUCCESS",
	createdAt: "2026-02-01T10:00:00Z",
}));

function withLogs(logs: AuditLog[]): Decorator {
	return (Story) => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: Infinity } },
		});
		queryClient.setQueryData([listAuditLogsKey, {}], {
			pages: [{ logs, total: logs.length }],
			pageParams: [undefined],
		});

		return (
			<QueryClientProvider client={queryClient}>
				<Story />
			</QueryClientProvider>
		);
	};
}

const meta: Meta<typeof AuditLogsList> = {
	component: AuditLogsList,
	args: { filters: {}, onFiltersChange: () => {} },
};

export default meta;

type AuditLogsListStory = StoryObj<typeof AuditLogsList>;

export const Default: AuditLogsListStory = {
	decorators: [withLogs(LOGS), withAuthProviders],
};

export const Empty: AuditLogsListStory = {
	decorators: [withLogs([]), withAuthProviders],
};
