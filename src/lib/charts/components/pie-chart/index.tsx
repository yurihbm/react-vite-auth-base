import {
	Cell,
	Legend,
	Pie,
	PieChart as RechartsPieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

import { styles } from "./styles";

export interface PieChartSlice {
	key: string;
	label: string;
	value: number;
	/**
	 * Tailwind text-color class (e.g. `"text-primary"`) applied via
	 * `currentColor`.
	 */
	className?: string;
	/**
	 * Hex color for slices whose color comes from data rather than a Tailwind
	 * token.
	 */
	color?: string;
}

export interface PieChartProps {
	data: PieChartSlice[];
	height?: number;
	className?: string;
}

export function PieChart({ data, height = 280, className }: PieChartProps) {
	return (
		<div
			data-testid="pie-chart"
			className={styles({ className })}
			style={{ height }}
		>
			<ResponsiveContainer width="100%" height="100%">
				<RechartsPieChart>
					<Pie
						data={data}
						dataKey="value"
						nameKey="label"
						fill="currentColor"
						label
					>
						{data.map(({ key, className: sliceClassName, color }) => (
							<Cell
								key={key}
								className={sliceClassName}
								style={color ? { color } : undefined}
								fill="currentColor"
							/>
						))}
					</Pie>
					<Tooltip
						content={({ active, payload }) => {
							if (!active || !payload?.length) return null;

							const entry = payload[0];
							const slice = entry.payload as PieChartSlice;

							return (
								<div className="rounded-md border border-border bg-background-elevated px-3 py-2 text-sm shadow-md">
									<div
										className={`flex items-center gap-1.5 ${slice.className ?? ""}`}
										style={slice.color ? { color: slice.color } : undefined}
									>
										<span className="size-2 rounded-full bg-current" />
										<span className="text-foreground">
											{entry.name}: {entry.value}
										</span>
									</div>
								</div>
							);
						}}
					/>
					<Legend
						content={() => (
							<ul className="flex flex-wrap justify-center gap-4 pt-2 text-sm">
								{data.map(
									({ key, label, className: sliceClassName, color }) => (
										<li
											key={key}
											className={`flex items-center gap-1.5 ${sliceClassName ?? ""}`}
										>
											<span
												className="size-2.5 rounded-full bg-current"
												style={color ? { color } : undefined}
											/>
											<span className="text-foreground">{label}</span>
										</li>
									),
								)}
							</ul>
						)}
					/>
				</RechartsPieChart>
			</ResponsiveContainer>
		</div>
	);
}
