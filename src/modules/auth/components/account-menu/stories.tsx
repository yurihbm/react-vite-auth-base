import type { User } from "@modules/users";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { withAuthProviders } from "@modules/auth/components/decorators";
import { getMeKey } from "@modules/users";

import { AccountMenu } from ".";

const USER: User = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "Test User",
	email: "test@mail.com",
	role: "user",
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};

const withUser: Decorator = (Story) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { staleTime: Infinity } },
	});
	queryClient.setQueryData([getMeKey], USER);

	return (
		<QueryClientProvider client={queryClient}>
			<Story />
		</QueryClientProvider>
	);
};

const meta: Meta<typeof AccountMenu> = {
	component: AccountMenu,
	decorators: [withUser, withAuthProviders],
};

export default meta;

type AccountMenuStory = StoryObj<typeof AccountMenu>;

export const Default: AccountMenuStory = {};
