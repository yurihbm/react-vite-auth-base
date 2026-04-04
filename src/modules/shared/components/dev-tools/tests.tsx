import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { DevTools } from ".";

vi.mock("@tanstack/react-query-devtools", () => ({
	ReactQueryDevtools: vi.fn(() => null),
}));

vi.mock("@tanstack/react-router-devtools", () => ({
	TanStackRouterDevtools: vi.fn(() => null),
}));

describe("DevTools", () => {
	test("renders ReactQueryDevtools and TanStackRouterDevtools", () => {
		render(<DevTools />);

		expect(ReactQueryDevtools).toHaveBeenCalled();
		expect(TanStackRouterDevtools).toHaveBeenCalled();
	});
});
