import {
	CartesianGrid,
	Legend,
	Line,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { styles } from "./styles";

export interface LineChartSeries {
	key: string;
	label: string;
	/**
	 * Tailwind text-color class (e.g. `"text-success"`) applied via
	 * `currentColor`.
	 */
	className?: string;
}

export interface LineChartProps {
	data: Record<string, number | string>[];
	xKey: string;
	series: LineChartSeries[];
	height?: number;
	className?: string;
}

export function LineChart({
	data,
	xKey,
	series,
	height = 280,
	className,
}: LineChartProps) {
	return (
		<div
			data-testid="line-chart"
			className={styles({ className })}
			style={{ height }}
		>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsLineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={xKey} />
					<YAxis />
					<Tooltip
						content={({ active, payload, label }) => {
							if (!active || !payload?.length) return null;

							return (
								<div className="rounded-md border border-border bg-background-elevated px-3 py-2 text-sm shadow-md">
									<p className="mb-1 font-medium text-foreground">{label}</p>
									<ul className="flex flex-col gap-1">
										{payload.map((entry) => {
											const dataKey = String(entry.dataKey);
											const seriesClassName = series.find(
												(item) => item.key === dataKey,
											)?.className;

											return (
												<li
													key={dataKey}
													className={`flex items-center gap-1.5 ${seriesClassName ?? ""}`}
												>
													<span className="size-2 rounded-full bg-current" />
													<span className="text-foreground">
														{entry.name}: {entry.value}
													</span>
												</li>
											);
										})}
									</ul>
								</div>
							);
						}}
					/>
					<Legend
						content={() => (
							<ul className="flex flex-wrap justify-center gap-4 pt-2 text-sm">
								{series.map(({ key, label, className: seriesClassName }) => (
									<li
										key={key}
										className={`flex items-center gap-1.5 ${seriesClassName ?? ""}`}
									>
										<span className="size-2.5 rounded-full bg-current" />
										<span className="text-foreground">{label}</span>
									</li>
								))}
							</ul>
						)}
					/>
					{series.map(({ key, label, className: seriesClassName }) => (
						<Line
							key={key}
							type="monotone"
							dataKey={key}
							name={label}
							className={seriesClassName}
							stroke="currentColor"
							dot={false}
						/>
					))}
				</RechartsLineChart>
			</ResponsiveContainer>
		</div>
	);
}
