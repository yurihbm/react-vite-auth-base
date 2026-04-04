import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { createQueryClientWrapper } from ".";

describe("createQueryClientWrapper", () => {
	test("returns a wrapper component", () => {
		const Wrapper = createQueryClientWrapper();

		expect(Wrapper).toBeTypeOf("function");
	});

	test("provides query client context for hook tests", () => {
		const { result } = renderHook(() => useQueryClient(), {
			wrapper: createQueryClientWrapper(),
		});

		expect(result.current).toBeInstanceOf(QueryClient);
	});
});
