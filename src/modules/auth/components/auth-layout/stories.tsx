import type { Meta, StoryObj } from "@storybook/react-vite";
import type { AuthLayoutProps } from ".";

import { Alert, Button, TextInput } from "@lib/ui";

import { AuthLayout } from ".";

const meta: Meta<AuthLayoutProps> = {
	component: AuthLayout,
	args: {
		title: "Sign in",
		description: "Welcome back. Sign in to continue.",
		children: (
			<form className="flex flex-col gap-2">
				<TextInput label="Email" type="email" />
				<TextInput label="Password" type="password" />
				<Button type="submit">Sign in</Button>
			</form>
		),
		footer: (
			<>
				New here?{" "}
				<a className="underline" href="#register">
					Create an account
				</a>
			</>
		),
	},
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;

type AuthLayoutStory = StoryObj<AuthLayoutProps>;

export const Default: AuthLayoutStory = {};

export const WithAlert: AuthLayoutStory = {
	args: {
		alert: (
			<Alert
				color="warning"
				description="Your session has expired. Please sign in again."
			/>
		),
	},
};
