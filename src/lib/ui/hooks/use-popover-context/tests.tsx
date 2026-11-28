import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { usePopoverContext } from ".";

describe("usePopoverContext", () => {
	test("throws a helpful error when used outside a Popover", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => renderHook(() => usePopoverContext())).toThrow(
			"Popover.Trigger and Popover.Content must be rendered inside Popover",
		);
	});
});
