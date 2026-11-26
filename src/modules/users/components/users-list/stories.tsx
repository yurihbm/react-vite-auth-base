import type { User } from "@modules/users/types";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { withAuthProviders } from "@modules/auth/components/decorators";
import { listUsersKey } from "@modules/users/services";

import { UsersList } from ".";

const USERS: User[] = Array.from({ length: 200 }, (_, index) => ({
	uuid: `6f1f7c52-6f0c-4a52-9a43-${String(index).padStart(12, "0")}`,
	name: `User ${index}`,
	email: `user${index}@example.com`,
	role: index % 10 === 0 ? "admin" : "user",
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
}));

function withUsers(users: User[]): Decorator {
	return (Story) => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: Infinity } },
		});
		queryClient.setQueryData([listUsersKey, {}], {
			pages: [{ users, total: users.length }],
			pageParams: [undefined],
		});

		return (
			<QueryClientProvider client={queryClient}>
				<Story />
			</QueryClientProvider>
		);
	};
}

const meta: Meta<typeof UsersList> = {
	component: UsersList,
	args: { onFiltersChange: () => {} },
};

export default meta;

type UsersListStory = StoryObj<typeof UsersList>;

export const Default: UsersListStory = {
	decorators: [withUsers(USERS), withAuthProviders],
};

export const Empty: UsersListStory = {
	decorators: [withUsers([]), withAuthProviders],
};
