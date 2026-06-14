import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DialogProps } from ".";

import { useState } from "react";

import { Dialog } from ".";
import { Button } from "../button";

const meta: Meta<DialogProps> = {
	component: Dialog,
	argTypes: {
		size: {
			options: ["sm", "md", "lg"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type DialogStory = StoryObj<DialogProps>;

export const Default: DialogStory = {
	render: function Render(args) {
		const [open, setOpen] = useState(false);

		return (
			<>
				<Button onClick={() => setOpen(true)}>Open dialog</Button>
				<Dialog
					{...args}
					open={open}
					onClose={() => setOpen(false)}
					title="Delete project"
					description="This action cannot be undone."
					footer={
						<>
							<Button color="subtle" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button color="danger" onClick={() => setOpen(false)}>
								Delete
							</Button>
						</>
					}
				>
					<p className="text-sm text-foreground-muted">
						Are you sure you want to delete this project? All of its data will
						be permanently removed.
					</p>
				</Dialog>
			</>
		);
	},
};
