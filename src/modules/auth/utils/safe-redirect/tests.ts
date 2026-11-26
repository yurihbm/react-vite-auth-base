import { describe, expect, test } from "vitest";

import { safeRedirect } from ".";

describe("safeRedirect", () => {
	test.each(["/", "/account", "/account?tab=1#top"])("keeps %s", (path) => {
		expect(safeRedirect(path)).toBe(path);
	});

	test.each([
		undefined,
		"",
		42,
		"account",
		"//evil.com",
		"/\\evil.com",
		"https://evil.com",
		"javascript:alert(1)",
	])("falls back to home for %s", (value) => {
		expect(safeRedirect(value)).toBe("/");
	});
});
