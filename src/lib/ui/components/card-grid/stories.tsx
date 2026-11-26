import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CardGridProps } from ".";

import { Card } from "@lib/ui/components/card";

import { CardGrid } from ".";

const meta: Meta<CardGridProps> = {
	component: CardGrid,
	args: {
		children: (
			<>
				<Card header="Title 1">CardGrid - Card 1</Card>
				<Card header="Title 2">CardGrid - Card 2</Card>
				<Card header="Title 3">CardGrid - Card 3</Card>
				<Card header="Title 4">CardGrid - Card 4</Card>
				<Card header="Title 5">CardGrid - Card 5</Card>
				<Card header="Title 6">CardGrid - Card 6</Card>
			</>
		),
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
