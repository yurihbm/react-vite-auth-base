import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TextInputProps } from ".";

import { KeyIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

import { TextInput } from ".";

const meta: Meta<TextInputProps> = {
	component: TextInput,
	args: {
		placeholder: "Type something...",
		label: "Text Input",
		message: "Helper text goes here",
	},
	decorators: [
		(Story) => (
			<div className="max-w-96">
				<Story />
			</div>
		),
	],
};

export default meta;

type TextInputStory = StoryObj<TextInputProps>;

export const Default: TextInputStory = {};

export const Disabled: TextInputStory = {
	args: {
		disabled: true,
	},
};

export const ErrorState: TextInputStory = {
	args: {
		isError: true,
		message: "This field is required.",
	},
};

export const SuccessState: TextInputStory = {
	args: {
		isSuccess: true,
		message: "Looks good!",
	},
};

export const WithStartIcon: TextInputStory = {
	args: {
		startIcon: <MagnifyingGlassIcon size={20} />,
	},
};

export const WithEndIcon: TextInputStory = {
	args: {
		endIcon: <KeyIcon size={20} />,
	},
};
