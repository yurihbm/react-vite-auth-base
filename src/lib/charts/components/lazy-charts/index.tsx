import type { LineChartProps } from "@lib/charts/components/line-chart";
import type { PieChartProps } from "@lib/charts/components/pie-chart";

import { lazy, Suspense } from "react";

import { Skeleton } from "@lib/ui";

// Recharts is the app's largest dependency, so the chart implementations are
// split off and only fetched once a chart actually renders. Importing a chart
// through the `@lib/charts` barrel no longer pulls Recharts into the importer's
// chunk.
const LazyLineChart = lazy(async () => ({
	default: (await import("@lib/charts/components/line-chart")).LineChart,
}));
const LazyPieChart = lazy(async () => ({
	default: (await import("@lib/charts/components/pie-chart")).PieChart,
}));

interface ChartFallbackProps {
	height?: number;
	className?: string;
}

function ChartFallback({ height = 280, className }: ChartFallbackProps) {
	return (
		<Skeleton
			data-testid="chart-fallback"
			variant="rect"
			className={className}
			style={{ height }}
		/>
	);
}

export function LineChart(props: LineChartProps) {
	return (
		<Suspense fallback={<ChartFallback {...props} />}>
			<LazyLineChart {...props} />
		</Suspense>
	);
}

export function PieChart(props: PieChartProps) {
	return (
		<Suspense fallback={<ChartFallback {...props} />}>
			<LazyPieChart {...props} />
		</Suspense>
	);
}
