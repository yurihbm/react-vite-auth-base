import { describe, expect, test } from "vitest";

import { translationKey } from ".";

describe("translationKey", () => {
	test("returns the key unchanged", () => {
		expect(translationKey<"shared">("shared:en")).toBe("shared:en");
	});
});
