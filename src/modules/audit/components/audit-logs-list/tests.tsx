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
import {
	useAuditLogsList,
	useAuditStatusCounts,
} from "@modules/audit/services";

import { AuditLogsList } from ".";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		params,
		children,
		title,
	}: {
		to: string;
		params: { uuid: string };
		children: React.ReactNode;
		title?: string;
	}) => (
		<a href={to.replace("$uuid", params.uuid)} title={title}>
			{children}
		</a>
	),
}));

// Translates one action label so the test can tell it from the raw fallback.
vi.mock("@lib/i18n", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@lib/i18n")>();

	return {
		...actual,
		useTranslate: ((namespace: "audit") => {
			const t = actual.useTranslate(namespace);

			return ((key: string, options?: object) =>
				key === "auditLogsList.actions.USER_UPDATE"
					? "User updated"
					: t(key as never, options as never)) as unknown as typeof t;
		}) as typeof actual.useTranslate,
	};
});

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/audit/services", () => ({
	useAuditLogsList: vi.fn(),
	useAuditStatusCounts: vi.fn(),
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
			isPlaceholderData: false,
			error: null,
			fetchNextPage,
			...state,
		} as unknown as ReturnType<typeof useAuditLogsList>);
		vi.mocked(useAuditStatusCounts).mockReturnValue({
			data: { success: 38, failure: 2 },
		} as unknown as ReturnType<typeof useAuditStatusCounts>);
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

	test("links the actor and user resources to the user, in the table and the cards", () => {
		renderList();

		const hrefs = screen
			.getAllByRole("link")
			.map((link) => link.getAttribute("href"));

		expect(
			hrefs.filter((href) => href === `/admin/users/${ACTOR}`),
		).toHaveLength(2);
		expect(
			hrefs.filter((href) => href === `/admin/users/${OK_LOG.resourceUuid}`),
		).toHaveLength(2);
		expect(screen.getAllByTitle(ACTOR).length).toBeGreaterThan(0);
	});

	test("names actions and statuses in the user's language", () => {
		renderList();

		expect(screen.getAllByText("User updated").length).toBeGreaterThan(0);
		expect(
			screen.getAllByText("auditLogsList.status.success").length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByText(
				new Intl.DateTimeFormat("en", {
					dateStyle: "medium",
					timeStyle: "short",
				}).format(new Date(OK_LOG.createdAt)),
			).length,
		).toBeGreaterThan(0);
	});

	test("falls back to the raw action when it has no translation", () => {
		mockQuery({
			data: {
				pages: [{ logs: [{ ...OK_LOG, action: "FUTURE_ACTION" }], total: 1 }],
			},
		});
		renderList();

		expect(screen.getAllByText("FUTURE_ACTION").length).toBeGreaterThan(0);
	});

	test("shows the total", () => {
		renderList();

		expect(screen.getByText("auditLogsList.total")).toBeTruthy();
	});

	test("summarizes successes and failures for the current filters", () => {
		renderList({ filters: { action: "LOGIN" } });

		expect(useAuditStatusCounts).toHaveBeenCalledWith({ action: "LOGIN" });

		const summary = screen.getByRole("group", {
			name: "auditLogsList.summary.title",
		});

		expect(summary.textContent).toContain("38");
		expect(summary.textContent).toContain("2");
	});

	test("collapses the filters behind a toggle on small screens", () => {
		renderList();

		const toggle = screen.getByRole("button", {
			name: /auditLogsList\.filters\.toggle/,
		});
		const panel = document.getElementById(
			toggle.getAttribute("aria-controls") as string,
		) as HTMLElement;

		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		expect(panel.className).toContain("hidden");
		expect(panel.className).toContain("md:grid");

		fireEvent.click(toggle);

		expect(toggle.getAttribute("aria-expanded")).toBe("true");
		expect(panel.className).not.toContain("hidden");
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

	test("marks empty date inputs so they do not look filled in", () => {
		renderList();

		expect(
			screen
				.getByLabelText("auditLogsList.startDate.label")
				.getAttribute("data-empty"),
		).toBe("true");
	});

	test("loads the next page from the load more button", () => {
		mockQuery({ hasNextPage: true });
		renderList();

		fireEvent.click(
			screen.getByRole("button", { name: "auditLogsList.loadMore" }),
		);

		expect(fetchNextPage).toHaveBeenCalledTimes(1);
	});

	test("disables load more while fetching", () => {
		mockQuery({ hasNextPage: true, isFetchingNextPage: true });
		renderList();

		expect(
			(
				screen.getByRole("button", {
					name: "auditLogsList.loadingMore",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("dims the current rows while new filters load", () => {
		mockQuery({ isPlaceholderData: true, isFetching: true });
		const { container } = renderList();

		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
	});

	test("offers to clear the filters when they match nothing", () => {
		mockQuery({ data: { pages: [{ logs: [], total: 0 }] } });
		renderList({ filters: { action: "LOGIN" } });

		expect(screen.getByText("auditLogsList.emptyFiltered.title")).toBeTruthy();

		fireEvent.click(
			screen.getAllByRole("button", { name: "auditLogsList.clearFilters" })[0],
		);

		expect(onFiltersChange).toHaveBeenCalledWith({});
	});

	test("shows a plain empty state without filters", () => {
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

		expect(screen.getByRole("alert").textContent).toContain("translated:x");
	});
});
