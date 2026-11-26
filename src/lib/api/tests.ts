import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { jsonResponse, mockFetch } from "@lib/tests";

import { createAPIClient } from "./client";
import { DEFAULT_ERROR_MESSAGE, EMPTY_RESPONSE_MESSAGE } from "./constants";
import { APIError } from "./error";
import { request } from "./schemas";

const createJSONResponse = jsonResponse;

describe("createAPIClient", () => {
	const client = createAPIClient();
	const fetchMock = vi.fn<typeof fetch>();

	beforeEach(() => {
		fetchMock.mockReset();
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	test("sends GET requests with query params and default options", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse({
				data: [{ id: "1" }],
				message: "ok",
			}),
		);

		const response = await client.get<{ id: string }[]>("users", {
			params: {
				page: 2,
				search: "john",
			},
		});

		expect(response).toEqual({
			data: [{ id: "1" }],
			message: "ok",
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
		const parsedURL = new URL(url);

		expect(parsedURL.pathname).toContain("/users");
		expect(parsedURL.searchParams.get("page")).toBe("2");
		expect(parsedURL.searchParams.get("search")).toBe("john");
		expect(options.method).toBe("GET");
		expect(options.credentials).toBe("include");
		expect(options.signal).toBeDefined();
	});

	test("sends POST requests with JSON body and content-type", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse({
				data: { id: "2" },
				message: "created",
			}),
		);

		const payload = { email: "john@doe.com", password: "secret" };

		const response = await client.post<typeof payload, { id: string }>(
			"/auth/register",
			{ data: payload },
		);

		expect(response).toEqual({
			data: { id: "2" },
			message: "created",
		});

		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

		expect(options.method).toBe("POST");
		expect(options.body).toBe(JSON.stringify(payload));
		expect(options.credentials).toBe("include");
		expect(options.headers).toEqual({
			"Content-Type": "application/json",
		});
	});

	test("allows POST, PATCH and PUT requests without body", async () => {
		fetchMock
			.mockResolvedValueOnce(
				createJSONResponse({
					data: { ok: true },
					message: "ok",
				}),
			)
			.mockResolvedValueOnce(
				createJSONResponse({
					data: { ok: true },
					message: "ok",
				}),
			)
			.mockResolvedValueOnce(
				createJSONResponse({
					data: { ok: true },
					message: "ok",
				}),
			);

		await client.post<unknown, { ok: boolean }>("/auth/login");
		await client.patch<unknown, { ok: boolean }>("/users/me");
		await client.put<unknown, { ok: boolean }>("/users/settings");

		const [, postOptions] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(postOptions.method).toBe("POST");
		expect(postOptions.body).toBeUndefined();

		const [, patchOptions] = fetchMock.mock.calls[1] as [string, RequestInit];
		expect(patchOptions.method).toBe("PATCH");
		expect(patchOptions.body).toBeUndefined();

		const [, putOptions] = fetchMock.mock.calls[2] as [string, RequestInit];
		expect(putOptions.method).toBe("PUT");
		expect(putOptions.body).toBeUndefined();
	});

	test("returns standard response for successful 204 requests", async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

		const response = await client.delete<void>("sessions/current");

		expect(response).toEqual({
			data: undefined,
			message: EMPTY_RESPONSE_MESSAGE,
		});
	});

	test("forwards provided AbortSignal", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse({
				data: { ok: true },
				message: "ok",
			}),
		);

		const controller = new AbortController();

		await client.get<{ ok: boolean }>("health", {
			signal: controller.signal,
		});

		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

		expect(options.signal?.aborted).toBe(false);
		controller.abort();
		expect(options.signal?.aborted).toBe(true);
		expect(options.signal?.reason).toMatchObject({ name: "AbortError" });
	});

	test("keeps the default timeout when a caller signal is provided", async () => {
		const timeout = new AbortController();
		const timeoutSpy = vi
			.spyOn(AbortSignal, "timeout")
			.mockReturnValue(timeout.signal);
		fetchMock.mockResolvedValueOnce(
			createJSONResponse({ data: { ok: true }, message: "ok" }),
		);

		await client.get("health", { signal: new AbortController().signal });

		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

		timeout.abort(new DOMException("timed out", "TimeoutError"));
		expect(options.signal?.aborted).toBe(true);
		expect(options.signal?.reason).toMatchObject({ name: "TimeoutError" });
		timeoutSpy.mockRestore();
	});

	test("throws APIError with the backend key, status and details", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse(
				{
					error: "request.validation_failed",
					details: {
						email: "invalid format",
					},
				},
				400,
			),
		);

		await expect(client.post("/auth/register", { data: {} })).rejects.toEqual(
			expect.objectContaining<Partial<APIError>>({
				name: "APIError",
				message: "request.validation_failed",
				status: 400,
				key: "request.validation_failed",
				details: {
					email: "invalid format",
				},
			}),
		);
	});

	test("falls back to the http status key when backend error is missing", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse(
				{
					message: "request failed",
				},
				400,
			),
		);

		await expect(client.get("/missing-error")).rejects.toEqual(
			expect.objectContaining<Partial<APIError>>({
				name: "APIError",
				message: DEFAULT_ERROR_MESSAGE,
				status: 400,
				key: "http.400",
			}),
		);
	});

	test("throws fallback APIError when response body cannot be parsed", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("not-json", {
				status: 500,
			}),
		);

		await expect(client.get("/unstable")).rejects.toEqual(
			expect.objectContaining<Partial<APIError>>({
				name: "APIError",
				status: 500,
				key: "http.500",
			}),
		);
	});

	test("throws fallback APIError for invalid JSON in successful responses", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("not-json", {
				status: 200,
			}),
		);

		await expect(client.get("/ok-but-invalid-json")).rejects.toEqual(
			expect.objectContaining<Partial<APIError>>({
				name: "APIError",
				status: 200,
				key: "client.invalidResponse",
			}),
		);
	});

	test("sends PATCH requests with JSON body", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse({
				data: { updated: true },
				message: "updated",
			}),
		);

		const payload = { username: "johnny" };

		const response = await client.patch<typeof payload, { updated: boolean }>(
			"/users/me",
			{ data: payload },
		);

		expect(response).toEqual({
			data: { updated: true },
			message: "updated",
		});

		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(options.method).toBe("PATCH");
		expect(options.body).toBe(JSON.stringify(payload));
		expect(options.headers).toEqual({
			"Content-Type": "application/json",
		});
	});

	test("sends PUT requests with JSON body", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse({
				data: { saved: true },
				message: "saved",
			}),
		);

		const payload = { locale: "en-US" };

		const response = await client.put<typeof payload, { saved: boolean }>(
			"/users/settings",
			{ data: payload },
		);

		expect(response).toEqual({
			data: { saved: true },
			message: "saved",
		});

		const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(options.method).toBe("PUT");
		expect(options.body).toBe(JSON.stringify(payload));
		expect(options.headers).toEqual({
			"Content-Type": "application/json",
		});
	});

	test("exposes meta.next_cursor as received", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse({
				data: [],
				message: "ok",
				meta: { total: 3, limit: 1, next_cursor: "abc" },
			}),
		);

		const { meta } = await client.get("/audit-logs");

		expect(meta).toEqual({ total: 3, limit: 1, next_cursor: "abc" });
	});
});

describe("APIError key resolution", () => {
	const client = createAPIClient();

	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	test.each([
		["error holds the key", { error: "users.notFound" }, "users.notFound"],
		[
			"message holds the key and error is free text",
			{ error: "Forbidden", message: "auth.forbidden" },
			"auth.forbidden",
		],
		[
			"error wins when both are keys",
			{ error: "users.notFound", message: "auth.forbidden" },
			"users.notFound",
		],
		["neither is a key", { error: "oops", message: "nope" }, "http.418"],
	])("%s", async (_, body, key) => {
		mockFetch({ "GET /x": jsonResponse(body, 418) });

		await expect(client.get("/x")).rejects.toMatchObject({
			status: 418,
			key,
		});
	});

	test("parses Retry-After seconds on 429", async () => {
		mockFetch({
			"GET /x": jsonResponse({ error: "rateLimit.exceeded" }, 429, {
				"Retry-After": "30",
			}),
		});

		await expect(client.get("/x")).rejects.toMatchObject({
			key: "rateLimit.exceeded",
			retryAfter: 30,
		});
	});

	test("leaves retryAfter undefined when the header is absent", async () => {
		mockFetch({
			"GET /x": jsonResponse({ error: "rateLimit.exceeded" }, 429),
		});

		await expect(client.get("/x")).rejects.toMatchObject({
			retryAfter: undefined,
		});
	});

	test("maps network failures to client.network", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fail")));

		await expect(client.get("/x")).rejects.toMatchObject({
			key: "client.network",
		});
	});

	test("maps timeouts to client.timeout", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockRejectedValue(new DOMException("timed out", "TimeoutError")),
		);

		await expect(client.get("/x")).rejects.toMatchObject({
			key: "client.timeout",
		});
	});

	test("rethrows caller aborts untouched", async () => {
		const abort = new DOMException("aborted", "AbortError");
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));

		await expect(client.get("/x")).rejects.toBe(abort);
	});
});

describe("refresh on 401", () => {
	const unauthorized = () => jsonResponse({ error: "auth.unauthorized" }, 401);
	const ok = jsonResponse({ data: { ok: true }, message: "ok" });
	const refreshed = jsonResponse({
		data: null,
		message: "auth.refresh.success",
	});

	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	test("refreshes once and replays the request", async () => {
		const fetchMock = mockFetch({
			"GET /users/me": [unauthorized, ok],
			"POST /auth/refresh": refreshed,
		});
		const client = createAPIClient();

		const response = await client.get("/users/me");

		expect(response.data).toEqual({ ok: true });
		expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);
		expect(fetchMock.callsTo("GET /users/me")).toHaveLength(2);
	});

	test("single-flights N parallel 401s into one refresh", async () => {
		const fetchMock = mockFetch({
			"GET /a": [unauthorized, ok],
			"GET /b": [unauthorized, ok],
			"GET /c": [unauthorized, ok],
			"POST /auth/refresh": refreshed,
		});
		const client = createAPIClient();

		await Promise.all([client.get("/a"), client.get("/b"), client.get("/c")]);

		expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);
	});

	test("replays only once when the replay is also 401", async () => {
		const fetchMock = mockFetch({
			"GET /x": unauthorized,
			"POST /auth/refresh": refreshed,
		});
		const client = createAPIClient();

		await expect(client.get("/x")).rejects.toMatchObject({
			key: "auth.unauthorized",
		});
		expect(fetchMock.callsTo("GET /x")).toHaveLength(2);
		expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);
	});

	test("does not refresh on other 401 keys", async () => {
		const fetchMock = mockFetch({
			"POST /auth/login": jsonResponse(
				{ error: "auth.authenticate.invalidCredentials" },
				401,
			),
		});
		const client = createAPIClient();

		await expect(client.post("/auth/login")).rejects.toMatchObject({
			key: "auth.authenticate.invalidCredentials",
		});
		expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(0);
	});

	test("never refreshes the refresh endpoint itself", async () => {
		const fetchMock = mockFetch({ "POST /auth/refresh": unauthorized });
		const client = createAPIClient();

		await expect(client.post("/auth/refresh")).rejects.toMatchObject({
			key: "auth.unauthorized",
		});
		expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);
	});

	test("calls onSessionExpired once and throws the 401 when refresh fails", async () => {
		const fetchMock = mockFetch({
			"GET /a": unauthorized,
			"GET /b": unauthorized,
			"POST /auth/refresh": jsonResponse(
				{ error: "auth.refresh.missingRefreshToken" },
				401,
			),
		});
		const client = createAPIClient();
		const onExpired = vi.fn();
		client.onSessionExpired(onExpired);

		const results = await Promise.allSettled([
			client.get("/a"),
			client.get("/b"),
		]);

		expect(results.map((r) => r.status)).toEqual(["rejected", "rejected"]);
		expect(results[0]).toMatchObject({
			reason: { key: "auth.unauthorized" },
		});
		expect(onExpired).toHaveBeenCalledTimes(1);
		expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);
	});

	test("stops notifying after unregistering onSessionExpired", async () => {
		mockFetch({
			"GET /a": unauthorized,
			"POST /auth/refresh": jsonResponse({ error: "x.y" }, 401),
		});
		const client = createAPIClient();
		const onExpired = vi.fn();
		client.onSessionExpired(onExpired)();

		await expect(client.get("/a")).rejects.toBeInstanceOf(APIError);
		expect(onExpired).not.toHaveBeenCalled();
	});

	test("does not expire the session when refresh fails by network", async () => {
		mockFetch({
			"GET /a": unauthorized,
			"POST /auth/refresh": () => {
				throw new TypeError("offline");
			},
		});
		const client = createAPIClient();
		const onExpired = vi.fn();
		client.onSessionExpired(onExpired);

		await expect(client.get("/a")).rejects.toBeInstanceOf(APIError);
		expect(onExpired).not.toHaveBeenCalled();
	});

	test.each([429, 500, 503])(
		"does not expire the session and throws the refresh error when refresh fails with %i",
		async (status) => {
			mockFetch({
				"GET /a": unauthorized,
				"POST /auth/refresh": jsonResponse({}, status),
			});
			const client = createAPIClient();
			const onExpired = vi.fn();
			client.onSessionExpired(onExpired);

			await expect(client.get("/a")).rejects.toMatchObject({
				status,
				key: `http.${status}`,
			});
			expect(onExpired).not.toHaveBeenCalled();
		},
	);

	test("expires the session when refresh is forbidden", async () => {
		mockFetch({
			"GET /a": unauthorized,
			"POST /auth/refresh": jsonResponse({ error: "auth.forbidden" }, 403),
		});
		const client = createAPIClient();
		const onExpired = vi.fn();
		client.onSessionExpired(onExpired);

		await expect(client.get("/a")).rejects.toMatchObject({
			key: "auth.unauthorized",
		});
		expect(onExpired).toHaveBeenCalledTimes(1);
	});

	describe("Web Locks", () => {
		const originalLocks = Object.getOwnPropertyDescriptor(navigator, "locks");

		afterEach(() => {
			if (originalLocks) {
				Object.defineProperty(navigator, "locks", originalLocks);
			} else {
				Reflect.deleteProperty(navigator, "locks");
			}
		});

		test("runs the refresh inside navigator.locks when available", async () => {
			const lockRequest = vi.fn(
				async (_name: string, callback: () => Promise<unknown>) => callback(),
			);
			Object.defineProperty(navigator, "locks", {
				configurable: true,
				value: { request: lockRequest },
			});
			mockFetch({
				"GET /x": [unauthorized, ok],
				"POST /auth/refresh": refreshed,
			});

			await createAPIClient().get("/x");

			expect(lockRequest).toHaveBeenCalledTimes(1);
			expect(lockRequest.mock.calls[0][0]).toBe("auth-refresh");
		});

		test("falls back to a plain refresh without navigator.locks", async () => {
			Object.defineProperty(navigator, "locks", {
				configurable: true,
				value: undefined,
			});
			const fetchMock = mockFetch({
				"GET /x": [unauthorized, ok],
				"POST /auth/refresh": refreshed,
			});

			await createAPIClient().get("/x");

			expect(fetchMock.callsTo("POST /auth/refresh")).toHaveLength(1);
		});
	});
});

describe("request", () => {
	const schema = z.object({ id: z.string() });

	test("returns the envelope with validated data", async () => {
		const result = await request(
			schema,
			Promise.resolve({ data: { id: "1" }, message: "ok" }),
		);

		expect(result).toEqual({ data: { id: "1" }, message: "ok" });
	});

	test("throws client.invalidResponse when data does not match", async () => {
		await expect(
			request(schema, Promise.resolve({ data: { id: 1 }, message: "ok" })),
		).rejects.toMatchObject({
			name: "APIError",
			key: "client.invalidResponse",
		});
	});

	test("propagates the call's own rejection", async () => {
		const error = new APIError("users.notFound", { status: 404 });

		await expect(request(schema, Promise.reject(error))).rejects.toBe(error);
	});

	test("accepts 204 responses with z.undefined()", async () => {
		const result = await request(
			z.undefined(),
			Promise.resolve({ data: undefined, message: EMPTY_RESPONSE_MESSAGE }),
		);

		expect(result.data).toBeUndefined();
	});
});
