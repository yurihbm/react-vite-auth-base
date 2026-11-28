import { createFileRoute } from "@tanstack/react-router";

import { LineChart, PieChart } from "@lib/charts";
import { useTranslate } from "@lib/i18n";
import { Container, PageHeader, Section, Stack } from "@lib/ui";
import { usePageTitle } from "@modules/shared";

export const Route = createFileRoute("/charts")({
	component: ChartsComponent,
});

// Illustrative sample data, not real figures.
const PIE_DATA = [
	{
		key: "groceries",
		label: "Groceries",
		value: 420,
		className: "text-chart-1",
	},
	{ key: "rent", label: "Rent", value: 1200, className: "text-chart-2" },
	{
		key: "transport",
		label: "Transport",
		value: 260,
		className: "text-chart-3",
	},
	{ key: "leisure", label: "Leisure", value: 180, className: "text-chart-4" },
	{ key: "savings", label: "Savings", value: 340, className: "text-chart-5" },
];

const LINE_DATA = [
	{ month: "Mar", north: 32, south: 21, west: 14 },
	{ month: "Apr", north: 34, south: 26, west: 18 },
	{ month: "May", north: 31, south: 29, west: 22 },
	{ month: "Jun", north: 36, south: 24, west: 27 },
	{ month: "Jul", north: 33, south: 28, west: 25 },
	{ month: "Aug", north: 38, south: 25, west: 31 },
];

const LINE_SERIES = [
	{ key: "north", label: "North", className: "text-chart-1" },
	{ key: "south", label: "South", className: "text-chart-2" },
	{ key: "west", label: "West", className: "text-chart-3" },
];

const SWATCHES = [
	{ token: "chart-1", className: "bg-chart-1" },
	{ token: "chart-2", className: "bg-chart-2" },
	{ token: "chart-3", className: "bg-chart-3" },
	{ token: "chart-4", className: "bg-chart-4" },
	{ token: "chart-5", className: "bg-chart-5" },
];

function ChartsComponent() {
	const t = useTranslate("charts");

	usePageTitle(t("page.title"));

	return (
		<Container>
			<Stack gap="lg" className="py-6">
				<PageHeader
					title={t("page.title")}
					description={t("page.description")}
				/>
				<Section surface title={t("pie.title")}>
					<div aria-hidden="true">
						<PieChart data={PIE_DATA} />
					</div>
					<table className="sr-only">
						<caption>{t("pie.title")}</caption>
						<thead>
							<tr>
								<th scope="col">{t("table.category")}</th>
								<th scope="col">{t("table.value")}</th>
							</tr>
						</thead>
						<tbody>
							{PIE_DATA.map(({ key, label, value }) => (
								<tr key={key}>
									<th scope="row">{label}</th>
									<td>{value}</td>
								</tr>
							))}
						</tbody>
					</table>
				</Section>
				<Section surface title={t("line.title")}>
					<div aria-hidden="true">
						<LineChart data={LINE_DATA} xKey="month" series={LINE_SERIES} />
					</div>
					<table className="sr-only">
						<caption>{t("line.title")}</caption>
						<thead>
							<tr>
								<th scope="col">{t("table.month")}</th>
								{LINE_SERIES.map(({ key, label }) => (
									<th key={key} scope="col">
										{label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{LINE_DATA.map((row) => (
								<tr key={row.month}>
									<th scope="row">{row.month}</th>
									{LINE_SERIES.map(({ key }) => (
										<td key={key}>{row[key as keyof typeof row]}</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</Section>
				<Section
					surface
					title={t("palette.title")}
					description={t("palette.description")}
				>
					<ul className="flex flex-wrap gap-4">
						{SWATCHES.map(({ token, className }) => (
							<li key={token} className="flex items-center gap-2 text-sm">
								<span
									aria-hidden="true"
									className={`size-6 rounded-control ${className}`}
								/>
								<code>{token}</code>
							</li>
						))}
					</ul>
				</Section>
			</Stack>
		</Container>
	);
}
