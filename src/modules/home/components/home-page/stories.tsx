import type { User } from "@modules/users";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { withAuthProviders } from "@modules/auth/components/decorators";
import { getMeKey } from "@modules/users";

import { HomePage } from ".";

function withUser(user: User | null): Decorator {
	return (Story) => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: Infinity, retry: false } },
		});
		queryClient.setQueryData([getMeKey], user);

		return (
			<QueryClientProvider client={queryClient}>
				<Story />
			</QueryClientProvider>
		);
	};
}

const USER: User = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "Test User",
	email: "test@mail.com",
	role: "user",
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};

const meta: Meta<typeof HomePage> = {
	component: HomePage,
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;

type HomePageStory = StoryObj<typeof HomePage>;

export const SignedOut: HomePageStory = {
	decorators: [withUser(null), withAuthProviders],
};

export const SignedIn: HomePageStory = {
	decorators: [withUser(USER), withAuthProviders],
};

export const Admin: HomePageStory = {
	decorators: [
		withUser({ ...USER, name: "Admin User", role: "admin" }),
		withAuthProviders,
	],
};
