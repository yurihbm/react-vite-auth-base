import type { SelectOption } from "@src/modules/shared/components/option-list/types";

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { useFilteredOptions } from ".";

const OPTIONS: SelectOption[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Grape", value: "grape" },
];

describe("useFilteredOptions", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	test("returns all options when query is empty (local mode)", () => {
		const { result } = renderHook(() =>
			useFilteredOptions({ options: OPTIONS, query: "" }),
		);

		expect(result.current.filtered).toHaveLength(3);
		expect(result.current.isLoading).toBe(false);
	});

	test("filters locally by label, case-insensitive", () => {
		const { result } = renderHook(() =>
			useFilteredOptions({ options: OPTIONS, query: "AP" }),
		);

		expect(result.current.filtered.map((o) => o.value)).toEqual([
			"apple",
			"grape",
		]);
	});

	test("delegates to onSearch in async mode after debounce", async () => {
		const onSearch = vi.fn(async (query: string) =>
			OPTIONS.filter((o) => o.label.toLowerCase().startsWith(query)),
		);

		const { result } = renderHook(() =>
			useFilteredOptions({
				options: OPTIONS,
				query: "b",
				onSearch,
				debounceMs: 10,
			}),
		);

		await waitFor(() => {
			expect(result.current.filtered.map((o) => o.value)).toEqual(["banana"]);
		});
		expect(onSearch).toHaveBeenCalledWith("b");
		expect(result.current.isLoading).toBe(false);
	});

	test("exposes isLoading while async search is pending", async () => {
		vi.useFakeTimers();
		const onSearch = vi.fn(() => new Promise<SelectOption[]>(() => {}));

		const { result } = renderHook(() =>
			useFilteredOptions({
				options: OPTIONS,
				query: "x",
				onSearch,
				debounceMs: 10,
			}),
		);

		act(() => {
			vi.advanceTimersByTime(10);
		});

		expect(result.current.isLoading).toBe(true);
	});

	test("syncs initial async options when the options prop changes", () => {
		vi.useFakeTimers();
		const onSearch = vi.fn(() => new Promise<SelectOption[]>(() => {}));
		const { result, rerender } = renderHook(
			({ options }) =>
				useFilteredOptions({
					options,
					query: "",
					onSearch,
					debounceMs: 10_000,
				}),
			{ initialProps: { options: OPTIONS } },
		);
		const updatedOptions = [{ label: "Cherry", value: "cherry" }];

		rerender({ options: updatedOptions });

		expect(result.current.filtered).toEqual(updatedOptions);
	});
});
