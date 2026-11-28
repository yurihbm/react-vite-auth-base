import type { ComponentProps } from "react";

import {
	act,
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
import { useUsersList } from "@modules/users/services";

import { UsersList } from ".";

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

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

vi.mock("@modules/users/services", () => ({
	useUsersList: vi.fn(),
}));

const JOHN = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "John Doe",
	email: "john@doe.com",
	role: "user" as const,
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};
const JANE = {
	...JOHN,
	uuid: "0b6f7c52-6f0c-4a52-9a43-0a3a1c2f6b22",
	name: "Jane Roe",
	email: "jane@roe.com",
	role: "admin" as const,
};

describe("UsersList", () => {
	const onFiltersChange = vi.fn();
	const fetchNextPage = vi.fn();

	function mockQuery(state: Record<string, unknown> = {}) {
		vi.mocked(useUsersList).mockReturnValue({
			data: { pages: [{ users: [JOHN, JANE], total: 2 }] },
			hasNextPage: false,
			isFetchingNextPage: false,
			isPending: false,
			isPlaceholderData: false,
			error: null,
			fetchNextPage,
			...state,
		} as unknown as ReturnType<typeof useUsersList>);
	}

	// The role Select renders a virtualized option list.
	let restoreVirtualizerEnv: () => void;

	beforeAll(() => {
		restoreVirtualizerEnv = setupVirtualizerEnv();
	});

	afterAll(() => {
		restoreVirtualizerEnv();
	});

	function renderList(props: Partial<ComponentProps<typeof UsersList>> = {}) {
		return render(<UsersList onFiltersChange={onFiltersChange} {...props} />);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		mockQuery();
	});

	afterEach(() => {
		cleanup();
	});

	test("queries with the filters it receives", () => {
		renderList({ search: "jo", role: "admin" });

		expect(useUsersList).toHaveBeenCalledWith({ search: "jo", role: "admin" });
	});

	test("links every user to its detail page in the table and the mobile list", () => {
		renderList();

		const links = screen.getAllByRole("link", { name: /John Doe/ });

		expect(links).toHaveLength(2);
		for (const link of links) {
			expect(link.getAttribute("href")).toBe(`/admin/users/${JOHN.uuid}`);
		}
		expect(screen.getAllByText("jane@roe.com")).toHaveLength(2);
	});

	test("shows the total", () => {
		renderList();

		expect(screen.getByText("usersList.total")).toBeTruthy();
	});

	test("reports the search text with the current role after a pause", () => {
		vi.useFakeTimers();
		renderList({ role: "admin" });

		fireEvent.change(screen.getByLabelText("usersList.search.label"), {
			target: { value: "jo" },
		});
		expect(onFiltersChange).not.toHaveBeenCalled();

		act(() => vi.advanceTimersByTime(300));
		vi.useRealTimers();

		expect(onFiltersChange).toHaveBeenCalledWith({
			search: "jo",
			role: "admin",
		});
	});

	test("clearing the search reports it as undefined", () => {
		vi.useFakeTimers();
		renderList({ search: "jo" });

		fireEvent.change(screen.getByLabelText("usersList.search.label"), {
			target: { value: "" },
		});
		act(() => vi.advanceTimersByTime(300));
		vi.useRealTimers();

		expect(onFiltersChange).toHaveBeenCalledWith({
			search: undefined,
			role: undefined,
		});
	});

	test("follows the search changed from outside without pushing it back", () => {
		vi.useFakeTimers();
		const { rerender } = renderList({ search: "jo" });

		rerender(<UsersList search="al" onFiltersChange={onFiltersChange} />);
		act(() => vi.advanceTimersByTime(600));
		vi.useRealTimers();

		expect(
			(screen.getByLabelText("usersList.search.label") as HTMLInputElement)
				.value,
		).toBe("al");
		expect(onFiltersChange).not.toHaveBeenCalled();
	});

	test("reports the selected role and maps 'all' to undefined", () => {
		renderList({ search: "jo" });

		fireEvent.click(screen.getByRole("combobox"));
		fireEvent.click(
			within(screen.getByRole("listbox")).getByText("usersList.role.admin"),
		);
		expect(onFiltersChange).toHaveBeenCalledWith({
			search: "jo",
			role: "admin",
		});

		fireEvent.click(screen.getByRole("combobox"));
		fireEvent.click(
			within(screen.getByRole("listbox")).getByText("usersList.role.all"),
		);
		expect(onFiltersChange).toHaveBeenLastCalledWith({
			search: "jo",
			role: undefined,
		});
	});

	test("loads the next page from the load more button", () => {
		mockQuery({ hasNextPage: true });
		renderList();

		fireEvent.click(screen.getByRole("button", { name: "usersList.loadMore" }));

		expect(fetchNextPage).toHaveBeenCalledTimes(1);
		expect(screen.getByText("usersList.showing")).toBeTruthy();
	});

	test("hides load more without a next page and disables it while loading", () => {
		const { unmount } = renderList();

		expect(
			screen.queryByRole("button", { name: "usersList.loadMore" }),
		).toBeNull();
		unmount();

		mockQuery({ hasNextPage: true, isFetchingNextPage: true });
		renderList();

		expect(
			(
				screen.getByRole("button", {
					name: "usersList.loadingMore",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	test("dims the current rows while new filters load", () => {
		mockQuery({ isPlaceholderData: true, isFetching: true });
		const { container } = renderList();

		const results = container.querySelector('[aria-busy="true"]');

		expect(results).not.toBeNull();
		expect(results?.textContent).toContain("John Doe");
	});

	test("shows a loading placeholder before the first page", () => {
		mockQuery({ data: undefined, isPending: true });
		const { container } = renderList();

		expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
		expect(screen.queryByRole("table")).toBeNull();
	});

	test("offers to clear the filters when they match nobody", () => {
		mockQuery({ data: { pages: [{ users: [], total: 0 }] } });
		renderList({ search: "zz", role: "admin" });

		expect(screen.getByText("usersList.emptyFiltered.title")).toBeTruthy();

		fireEvent.click(
			screen.getByRole("button", { name: "usersList.clearFilters" }),
		);

		expect(onFiltersChange).toHaveBeenCalledWith({});
	});

	test("shows a plain empty state without filters", () => {
		mockQuery({ data: { pages: [{ users: [], total: 0 }] } });
		renderList();

		expect(screen.getByText("usersList.empty")).toBeTruthy();
		expect(
			screen.queryByRole("button", { name: "usersList.clearFilters" }),
		).toBeNull();
	});

	test("shows the API error message", () => {
		mockQuery({
			data: undefined,
			error: new APIError("x", { status: 400, key: "x" }),
		});
		renderList();

		expect(screen.getByText("translated:x")).toBeTruthy();
		expect(
			screen.getByText("translated:x").closest('[role="alert"]'),
		).not.toBeNull();
	});
});
