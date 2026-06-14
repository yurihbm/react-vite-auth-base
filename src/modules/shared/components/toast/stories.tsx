import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ToastProviderProps } from ".";

import { ToastProvider } from ".";
import { Button } from "../button";
import { useToast } from "./use-toast";

const meta: Meta<ToastProviderProps> = {
	component: ToastProvider,
	argTypes: {
		position: {
			options: ["top-right", "top-left", "bottom-right", "bottom-left"],
			control: {
				type: "select",
			},
		},
	},
};

export default meta;

type ToastStory = StoryObj<ToastProviderProps>;

export const Default: ToastStory = {
	render: function Render(args) {
		function Demo() {
			const { toast } = useToast();

			return (
				<div className="flex flex-wrap gap-2">
					<Button
						color="subtle"
						onClick={() =>
							toast({ title: "Heads up", description: "Just so you know." })
						}
					>
						Default
					</Button>
					<Button
						color="success"
						onClick={() => toast({ title: "Saved", color: "success" })}
					>
						Success
					</Button>
					<Button
						color="danger"
						onClick={() =>
							toast({
								title: "Something went wrong",
								description: "Please try again.",
								color: "danger",
							})
						}
					>
						Danger
					</Button>
				</div>
			);
		}

		return (
			<ToastProvider {...args}>
				<Demo />
			</ToastProvider>
		);
	},
};
