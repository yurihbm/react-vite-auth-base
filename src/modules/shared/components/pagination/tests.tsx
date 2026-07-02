import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Pagination } from ".";

afterEach(cleanup);

describe("Pagination", () => {
	test("renders correctly", () => {
		const { container } = render(
			<Pagination page={3} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(container).toMatchSnapshot();
	});

	test("shows both ellipses when in the middle", () => {
		const { container } = render(
			<Pagination
				page={5}
				totalPages={10}
				siblingCount={1}
				onPageChange={vi.fn()}
			/>,
		);

		expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
	});

	test("shows no leading ellipsis when near start", () => {
		const { container } = render(
			<Pagination
				page={2}
				totalPages={10}
				siblingCount={1}
				onPageChange={vi.fn()}
			/>,
		);

		expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
	});

	test("shows no trailing ellipsis when near end", () => {
		const { container } = render(
			<Pagination
				page={9}
				totalPages={10}
				siblingCount={1}
				onPageChange={vi.fn()}
			/>,
		);

		expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
	});

	test("calls onPageChange with correct page when page button clicked", () => {
		const onPageChange = vi.fn();
		const { getByRole } = render(
			<Pagination page={3} totalPages={10} onPageChange={onPageChange} />,
		);

		fireEvent.click(getByRole("button", { name: "Page 4" }));

		expect(onPageChange).toHaveBeenCalledWith(4);
	});

	test("disables Previous button when on first page", () => {
		const { getByRole } = render(
			<Pagination page={1} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(
			(getByRole("button", { name: "Previous page" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});

	test("disables Next button when on last page", () => {
		const { getByRole } = render(
			<Pagination page={10} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(
			(getByRole("button", { name: "Next page" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});

	test("renders First/Last buttons when showEdgeButtons is true", () => {
		const { getByRole } = render(
			<Pagination page={3} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(getByRole("button", { name: "First page" })).toBeTruthy();
		expect(getByRole("button", { name: "Last page" })).toBeTruthy();
	});

	test("omits First/Last buttons when showEdgeButtons is false", () => {
		const { queryByRole } = render(
			<Pagination
				page={3}
				totalPages={10}
				showEdgeButtons={false}
				onPageChange={vi.fn()}
			/>,
		);

		expect(queryByRole("button", { name: "First page" })).toBeNull();
		expect(queryByRole("button", { name: "Last page" })).toBeNull();
	});

	test("marks the current page button with aria-current", () => {
		const { getByRole } = render(
			<Pagination page={3} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(
			getByRole("button", { name: "Page 3" }).getAttribute("aria-current"),
		).toBe("page");
	});

	test("calls onPageChange with page-1 when Previous button clicked", () => {
		const onPageChange = vi.fn();
		const { getByRole } = render(
			<Pagination page={5} totalPages={10} onPageChange={onPageChange} />,
		);

		fireEvent.click(getByRole("button", { name: "Previous page" }));

		expect(onPageChange).toHaveBeenCalledWith(4);
	});

	test("calls onPageChange with page+1 when Next button clicked", () => {
		const onPageChange = vi.fn();
		const { getByRole } = render(
			<Pagination page={5} totalPages={10} onPageChange={onPageChange} />,
		);

		fireEvent.click(getByRole("button", { name: "Next page" }));

		expect(onPageChange).toHaveBeenCalledWith(6);
	});

	test("calls onPageChange with 1 when First button clicked", () => {
		const onPageChange = vi.fn();
		const { getByRole } = render(
			<Pagination page={5} totalPages={10} onPageChange={onPageChange} />,
		);

		fireEvent.click(getByRole("button", { name: "First page" }));

		expect(onPageChange).toHaveBeenCalledWith(1);
	});

	test("calls onPageChange with totalPages when Last button clicked", () => {
		const onPageChange = vi.fn();
		const { getByRole } = render(
			<Pagination page={5} totalPages={10} onPageChange={onPageChange} />,
		);

		fireEvent.click(getByRole("button", { name: "Last page" }));

		expect(onPageChange).toHaveBeenCalledWith(10);
	});

	test("disables First button when on first page", () => {
		const { getByRole } = render(
			<Pagination page={1} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(
			(getByRole("button", { name: "First page" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});

	test("disables Last button when on last page", () => {
		const { getByRole } = render(
			<Pagination page={10} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(
			(getByRole("button", { name: "Last page" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
	});

	test("renders nothing when totalPages is less than or equal to 1", () => {
		const { container } = render(
			<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
		);

		expect(container.firstChild).toBeNull();
	});

	test("clamps page below 1: Previous is disabled and Page 1 is active", () => {
		const { getByRole } = render(
			<Pagination page={0} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(
			(getByRole("button", { name: "Previous page" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		expect(
			getByRole("button", { name: "Page 1" }).getAttribute("aria-current"),
		).toBe("page");
	});

	test("clamps page above totalPages: Next is disabled and last page is active", () => {
		const { getByRole } = render(
			<Pagination page={99} totalPages={10} onPageChange={vi.fn()} />,
		);

		expect(
			(getByRole("button", { name: "Next page" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		expect(
			getByRole("button", { name: "Page 10" }).getAttribute("aria-current"),
		).toBe("page");
	});

	test("clamps page below 1: Previous click calls onPageChange(1) not (0)", () => {
		const onPageChange = vi.fn();
		const { getByRole } = render(
			<Pagination page={0} totalPages={10} onPageChange={onPageChange} />,
		);

		expect(
			(getByRole("button", { name: "Previous page" }) as HTMLButtonElement)
				.disabled,
		).toBe(true);
		expect(onPageChange).not.toHaveBeenCalled();
	});
});
