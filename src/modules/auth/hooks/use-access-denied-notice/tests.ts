import { renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useToast } from "@lib/ui";

import { useAccessDeniedNotice } from ".";

vi.mock("@lib/ui", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/ui")>()),
	useToast: vi.fn(),
}));

describe("useAccessDeniedNotice", () => {
	const toast = vi.fn();
	const onShown = vi.fn();

	beforeEach(() => {
		vi.mocked(useToast).mockReturnValue({
			toast,
			dismiss: vi.fn(),
			toasts: [],
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	test("shows one warning toast and reports it once", () => {
		renderHook(() => useAccessDeniedNotice(true, onShown), {
			wrapper: StrictMode,
		});

		expect(toast).toHaveBeenCalledTimes(1);
		expect(toast).toHaveBeenCalledWith({
			title: "accessDenied.title",
			description: "accessDenied.description",
			color: "warning",
		});
		expect(onShown).toHaveBeenCalledTimes(1);
	});

	test("does nothing when access was not denied", () => {
		renderHook(() => useAccessDeniedNotice(false, onShown));

		expect(toast).not.toHaveBeenCalled();
		expect(onShown).not.toHaveBeenCalled();
	});
});
