import { vi } from "vitest";

/** The request seen by a route handler. */
export interface MockRequest {
	url: URL;
	init: RequestInit;
}

type RouteHandler =
	| Response
	| ((request: MockRequest) => Response | Promise<Response>);

/**
 * A route answer. An array answers successive calls in order, repeating the
 * last entry once exhausted.
 */
export type MockRoute = RouteHandler | RouteHandler[];

/** Builds a JSON `Response`, as the API would send. */
export function jsonResponse(
	body: unknown,
	status = 200,
	headers: Record<string, string> = {},
): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json", ...headers },
	});
}

/**
 * Stubs the global `fetch` with a route table keyed by `"METHOD /path"`.
 * Requests with no matching route reject, so tests fail loudly.
 *
 * Call `vi.unstubAllGlobals()` to restore the real `fetch`.
 *
 * @example
 * 	```ts
 * 	const fetchMock = mockFetch({
 * 		"GET /users/me": jsonResponse({ data: user, message: "ok" }),
 * 		"POST /auth/refresh": [jsonResponse({}, 401), jsonResponse({})],
 * 	});
 * 	expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);
 * 	```;
 */
export function mockFetch(routes: Record<string, MockRoute>) {
	const counters = new Map<string, number>();
	const history: Array<MockRequest & { route: string }> = [];

	const fetchMock = vi.fn<typeof fetch>(async (input, init = {}) => {
		const url = new URL(String(input));
		const route = `${init.method ?? "GET"} ${url.pathname}`;
		const answer = routes[route];

		if (!answer) {
			throw new Error(`mockFetch: no route for "${route}"`);
		}

		history.push({ route, url, init });

		const index = counters.get(route) ?? 0;
		counters.set(route, index + 1);

		const handler = Array.isArray(answer)
			? answer[Math.min(index, answer.length - 1)]
			: answer;

		if (typeof handler === "function") {
			return handler({ url, init });
		}

		// A Response body can only be read once.
		return handler.clone();
	});

	vi.stubGlobal("fetch", fetchMock);

	return Object.assign(fetchMock, {
		/** Requests received by the given `"METHOD /path"` route, in order. */
		callsTo: (route: string) => history.filter((call) => call.route === route),
	});
}
