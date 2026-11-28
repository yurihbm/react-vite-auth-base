import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TextareaProps } from ".";

import { useState } from "react";

import { Textarea } from ".";

const meta: Meta<TextareaProps> = {
	component: Textarea,
	args: {
		placeholder: "Type something...",
		label: "Textarea",
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

type TextareaStory = StoryObj<TextareaProps>;

export const Default: TextareaStory = {};

export const WithLabel: TextareaStory = {
	args: {
		label: "Biography",
	},
};

export const WithMessage: TextareaStory = {
	args: {
		message: "Helper text goes here",
	},
};

export const ErrorState: TextareaStory = {
	args: {
		isError: true,
		message: "This field is required.",
	},
};

export const WithCharCount: TextareaStory = {
	render: function Render(args: TextareaProps) {
		const [value, setValue] = useState("");

		return (
			<Textarea
				{...args}
				maxLength={200}
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>
		);
	},
	args: {
		label: "Message",
		placeholder: "Up to 200 characters...",
	},
};

export const Disabled: TextareaStory = {
	args: {
		disabled: true,
	},
};

export const ReadOnly: TextareaStory = {
	args: {
		readOnly: true,
		defaultValue: "This content is read only.",
	},
};

export const LargeRows: TextareaStory = {
	args: {
		rows: 8,
	},
};
