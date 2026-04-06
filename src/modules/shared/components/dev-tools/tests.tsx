import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DevTools } from ".";

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
		render(<DevTools />);

		expect(ReactQueryDevtools).toHaveBeenCalled();
		expect(TanStackRouterDevtools).toHaveBeenCalled();
	});

	test("returns null in production environment", () => {
		vi.stubEnv("PROD", true);

		const { container } = render(<DevTools />);

		expect(container.firstChild).toBeNull();
	});
});
