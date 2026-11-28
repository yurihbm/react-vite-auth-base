import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { usePageTitle } from ".";

describe("usePageTitle", () => {
	afterEach(() => {
		document.title = "";
	});

	test("titles the tab with the page and the app name", () => {
		renderHook(() => usePageTitle("Account"));

		expect(document.title).toBe(`Account | ${import.meta.env.VITE_APP_NAME}`);
	});

	test("falls back to the app name while the page title is unknown", () => {
		renderHook(() => usePageTitle(undefined));

		expect(document.title).toBe(import.meta.env.VITE_APP_NAME);
		expect(import.meta.env.VITE_APP_NAME).toBe("React Vite Auth Base");
	});
});
