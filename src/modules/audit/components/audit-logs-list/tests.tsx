import type { ComponentProps } from "react";

import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";

import { APIError } from "@lib/api";
import { setupVirtualizerEnv } from "@lib/ui/components/option-list/test-support";
import { useAuditLogsList } from "@modules/audit/services";

import { AuditLogsList } from ".";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		params,
		children,
	}: {
		to: string;
		params: { uuid: string };
		children: React.ReactNode;
	}) => <a href={to.replace("$uuid", params.uuid)}>{children}</a>,
}));

vi.mock("@lib/charts", () => ({
	PieChart: ({ data }: { data: Array<{ key: string; value: number }> }) => (
		<div data-testid="pie-chart">
			{data.map((slice) => `${slice.key}:${slice.value}`).join(",")}
		</div>
	),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/audit/services", () => ({
	useAuditLogsList: vi.fn(),
}));

const ACTOR = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";
const OK_LOG = {
	uuid: "0196a0f0-0000-7000-8000-000000000001",
	actorUuid: ACTOR,
	ipAddress: "127.0.0.1",
	userAgent: "vitest",
	action: "USER_UPDATE",
	resourceType: "user",
	resourceUuid: "0b6f7c52-6f0c-4a52-9a43-0a3a1c2f6b22",
	requestUuid: "0196a0f0-0000-7000-8000-0000000000aa",
	status: "SUCCESS" as const,
	createdAt: "2026-02-01T10:00:00Z",
};
const FAILED_LOG = {
	...OK_LOG,
	uuid: "0196a0f0-0000-7000-8000-000000000002",
	actorUuid: undefined,
	action: "LOGIN",
	resourceType: "auth",
	status: "FAILURE" as const,
	failureReason: "invalid credentials",
};

describe("AuditLogsList", () => {
	const onFiltersChange = vi.fn();
	const fetchNextPage = vi.fn();
	let restoreVirtualizerEnv: () => void;

	function mockQuery(state: Record<string, unknown> = {}) {
		vi.mocked(useAuditLogsList).mockReturnValue({
			data: { pages: [{ logs: [OK_LOG, FAILED_LOG], total: 2 }] },
			hasNextPage: false,
			isFetchingNextPage: false,
			isPending: false,
			error: null,
			fetchNextPage,
			...state,
		} as unknown as ReturnType<typeof useAuditLogsList>);
	}

	function renderList(
		props: Partial<ComponentProps<typeof AuditLogsList>> = {},
	) {
		return render(
			<AuditLogsList
				filters={{}}
				onFiltersChange={onFiltersChange}
				{...props}
			/>,
		);
	}

	beforeAll(() => {
		restoreVirtualizerEnv = setupVirtualizerEnv();
	});

	afterAll(() => {
		restoreVirtualizerEnv();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockQuery();
	});

	afterEach(() => {
		cleanup();
	});

	test("queries with the filters it receives", () => {
		const filters = { action: "LOGIN", status: "FAILURE" as const };
		renderList({ filters });

		expect(useAuditLogsList).toHaveBeenCalledWith(filters);
	});

	test("renders a row per log with actor and resource linking to the user", () => {
		renderList();

		const links = screen.getAllByRole("link");
		expect(links.map((link) => link.getAttribute("href"))).toEqual([
			`/admin/users/${ACTOR}`,
			`/admin/users/${OK_LOG.resourceUuid}`,
		]);
		expect(screen.getByText("USER_UPDATE")).toBeTruthy();
		expect(screen.getByText("SUCCESS")).toBeTruthy();
		expect(screen.getByText("FAILURE")).toBeTruthy();
	});

	test("shows the total", () => {
		renderList();

		expect(screen.getByText("auditLogsList.total")).toBeTruthy();
	});

	test("summarizes the loaded logs by status", () => {
		renderList();

		expect(screen.getByTestId("pie-chart").textContent).toBe(
			"SUCCESS:1,FAILURE:1",
		);
	});

	test("reports the selected status and keeps the other filters", () => {
		renderList({ filters: { action: "LOGIN" } });

		fireEvent.click(
			screen.getByRole("combobox", { name: "auditLogsList.status.label" }),
		);
		fireEvent.click(
			within(screen.getByRole("listbox")).getByText(
				"auditLogsList.status.failure",
			),
		);

		expect(onFiltersChange).toHaveBeenCalledWith({
			action: "LOGIN",
			status: "FAILURE",
		});
	});

	test("maps the 'all' option to an undefined filter", () => {
		renderList({ filters: { action: "LOGIN" } });

		fireEvent.click(
			screen.getByRole("combobox", { name: "auditLogsList.action.label" }),
		);
		fireEvent.click(
			within(screen.getByRole("listbox")).getByText("auditLogsList.action.all"),
		);

		expect(onFiltersChange).toHaveBeenCalledWith({ action: undefined });
	});

	test("reports the actor uuid typed in", () => {
		renderList({ filters: { status: "SUCCESS" } });

		fireEvent.change(screen.getByLabelText("auditLogsList.actor.label"), {
			target: { value: ACTOR },
		});

		expect(onFiltersChange).toHaveBeenCalledWith({
			status: "SUCCESS",
			actorUuid: ACTOR,
		});
	});

	test("reports the selected resource type", () => {
		renderList();

		fireEvent.click(
			screen.getByRole("combobox", { name: "auditLogsList.resource.label" }),
		);
		fireEvent.click(
			within(screen.getByRole("listbox")).getByText(
				"auditLogsList.resource.auth",
			),
		);

		expect(onFiltersChange).toHaveBeenCalledWith({ resourceType: "auth" });
	});

	test("reports the date range as RFC 3339 and shows it back as local input", () => {
		const end = new Date("2026-03-01T10:00").toISOString();
		renderList({ filters: { status: "SUCCESS", endDate: end } });

		fireEvent.change(screen.getByLabelText("auditLogsList.startDate.label"), {
			target: { value: "2026-02-01T10:00" },
		});
		expect(onFiltersChange).toHaveBeenLastCalledWith({
			status: "SUCCESS",
			endDate: end,
			startDate: new Date("2026-02-01T10:00").toISOString(),
		});

		fireEvent.change(screen.getByLabelText("auditLogsList.endDate.label"), {
			target: { value: "" },
		});
		expect(onFiltersChange).toHaveBeenLastCalledWith({
			status: "SUCCESS",
			endDate: undefined,
		});
	});

	test("fills the date inputs from the filters", () => {
		const iso = new Date("2026-02-01T10:00").toISOString();
		renderList({ filters: { startDate: iso } });

		expect(
			(
				screen.getByLabelText(
					"auditLogsList.startDate.label",
				) as HTMLInputElement
			).value,
		).toBe("2026-02-01T10:00");
	});

	test("loads the next page when the end is reached", () => {
		mockQuery({ hasNextPage: true });
		renderList();

		expect(fetchNextPage).toHaveBeenCalled();
	});

	test("does not load more while fetching", () => {
		mockQuery({ hasNextPage: true, isFetchingNextPage: true });
		renderList();

		expect(fetchNextPage).not.toHaveBeenCalled();
	});

	test("shows the empty state", () => {
		mockQuery({ data: { pages: [{ logs: [], total: 0 }] } });
		renderList();

		expect(screen.getByText("auditLogsList.empty")).toBeTruthy();
	});

	test("shows the API error message", () => {
		mockQuery({
			data: undefined,
			error: new APIError("x", { status: 400, key: "x" }),
		});
		renderList();

		expect(screen.getByText("translated:x")).toBeTruthy();
	});
});
