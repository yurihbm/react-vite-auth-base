import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useDebouncedValue } from ".";

describe("useDebouncedValue", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("starts with the initial value", () => {
		const { result } = renderHook(() => useDebouncedValue("a", 300));

		expect(result.current).toBe("a");
	});

	test("updates only after the delay with no further changes", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebouncedValue(value, 300),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "ab" });
		act(() => vi.advanceTimersByTime(200));
		rerender({ value: "abc" });
		act(() => vi.advanceTimersByTime(200));
		expect(result.current).toBe("a");

		act(() => vi.advanceTimersByTime(100));
		expect(result.current).toBe("abc");
	});
});
