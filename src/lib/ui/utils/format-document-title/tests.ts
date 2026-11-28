import { describe, expect, test } from "vitest";

import { formatDocumentTitle } from ".";

describe("formatDocumentTitle", () => {
	test("puts the page before the app name", () => {
		expect(formatDocumentTitle("Log in", "Acme")).toBe("Log in | Acme");
	});

	test("uses the app name alone without a page", () => {
		expect(formatDocumentTitle(undefined, "Acme")).toBe("Acme");
		expect(formatDocumentTitle("  ", "Acme")).toBe("Acme");
	});
});
