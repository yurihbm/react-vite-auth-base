import type { User } from "@modules/users/types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { APIError } from "@lib/api";
import { withAuthProviders } from "@modules/auth/components/decorators";
import { getMeKey, getUserKey } from "@modules/users/services";

import { UserDetail } from ".";

const ADMIN: User = {
	uuid: "0b6f7c52-6f0c-4a52-9a43-0a3a1c2f6b22",
	name: "Admin User",
	email: "admin@mail.com",
	role: "admin",
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};

const USER: User = {
	...ADMIN,
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "Test User",
	email: "test@mail.com",
	role: "user",
};

function withQueries(seed: (queryClient: QueryClient) => void): Decorator {
	return (Story) => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: Infinity, retry: false } },
		});
		queryClient.setQueryData([getMeKey], ADMIN);
		seed(queryClient);

		return (
			<QueryClientProvider client={queryClient}>
				<Story />
			</QueryClientProvider>
		);
	};
}

const meta: Meta<typeof UserDetail> = {
	component: UserDetail,
	args: {
		uuid: USER.uuid,
		onDeleted: () => {},
	},
};

export default meta;

type UserDetailStory = StoryObj<typeof UserDetail>;

export const Default: UserDetailStory = {
	decorators: [
		withQueries((queryClient) =>
			queryClient.setQueryData([getUserKey, USER.uuid], USER),
		),
		withAuthProviders,
	],
};

export const NotFound: UserDetailStory = {
	args: { uuid: "missing" },
	decorators: [
		withQueries((queryClient) =>
			queryClient
				.getQueryCache()
				.build(queryClient, {
					queryKey: [getUserKey, "missing"],
				})
				.setState({
					status: "error",
					error: new APIError("users.notFound", { status: 404 }),
				}),
		),
		withAuthProviders,
	],
};
