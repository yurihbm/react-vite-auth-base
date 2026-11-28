import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { useDocumentTitle } from ".";

describe("useDocumentTitle", () => {
	beforeEach(() => {
		document.title = "Original";
	});

	afterEach(() => {
		document.title = "";
	});

	test("sets the document title and follows changes", () => {
		const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
			initialProps: { title: "Account | Acme" },
		});

		expect(document.title).toBe("Account | Acme");

		rerender({ title: "Security | Acme" });

		expect(document.title).toBe("Security | Acme");
	});

	test("restores the previous title on unmount", () => {
		const { unmount } = renderHook(() => useDocumentTitle("Users | Acme"));

		unmount();

		expect(document.title).toBe("Original");
	});
});
