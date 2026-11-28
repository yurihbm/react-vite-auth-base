import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PieChartProps } from ".";

import { PieChart } from ".";

const DATA = [
	{
		key: "groceries",
		label: "Groceries",
		value: 420,
		className: "text-chart-1",
	},
	{ key: "rent", label: "Rent", value: 1200, className: "text-chart-2" },
	{ key: "leisure", label: "Leisure", value: 180, className: "text-chart-3" },
];

const meta: Meta<PieChartProps> = {
	component: PieChart,
	args: {
		data: DATA,
	},
};

export default meta;

type Story = StoryObj<PieChartProps>;

export const Default: Story = {};
