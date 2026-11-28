import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DevTools } from ".";
import { areDevToolsEnabled } from "./utils";

vi.mock("@tanstack/react-query-devtools", () => ({
	ReactQueryDevtools: vi.fn(() => null),
}));

vi.mock("@tanstack/react-router-devtools", () => ({
	TanStackRouterDevtools: vi.fn(() => null),
}));

describe("DevTools", () => {
	afterEach(() => {
		cleanup();
		vi.unstubAllEnvs();
	});

	test("renders ReactQueryDevtools and TanStackRouterDevtools", () => {
		// undefined works as false
		vi.stubEnv("VITE_DISABLE_DEV_TOOLS", undefined);
		vi.stubEnv("PROD", false);

		render(<DevTools />);

		expect(ReactQueryDevtools).toHaveBeenCalled();
		expect(TanStackRouterDevtools).toHaveBeenCalled();
	});

	test("returns null in production environment", () => {
		vi.stubEnv("PROD", true);

		const { container } = render(<DevTools />);

		expect(container.firstChild).toBeNull();
	});

	test("returns null if VITE_DISABLE_DEV_TOOLS is true", () => {
		vi.stubEnv("VITE_DISABLE_DEV_TOOLS", "true");

		const { container } = render(<DevTools />);

		expect(container.firstChild).toBeNull();
		expect(ReactQueryDevtools).not.toHaveBeenCalled();
		expect(TanStackRouterDevtools).not.toHaveBeenCalled();
	});

	test("renders the devtools if VITE_DISABLE_DEV_TOOLS is false", () => {
		vi.stubEnv("VITE_DISABLE_DEV_TOOLS", "false");
		vi.stubEnv("PROD", false);

		render(<DevTools />);

		expect(ReactQueryDevtools).toHaveBeenCalled();
		expect(TanStackRouterDevtools).toHaveBeenCalled();
	});

	test.each([
		[false, undefined, true],
		[false, "true", false],
		[true, undefined, false],
	] as const)(
		"areDevToolsEnabled with PROD=%s and VITE_DISABLE_DEV_TOOLS=%s is %s",
		(prod, disabled, expected) => {
			vi.stubEnv("PROD", prod);
			vi.stubEnv("VITE_DISABLE_DEV_TOOLS", disabled);

			expect(areDevToolsEnabled()).toBe(expected);
		},
	);
});
