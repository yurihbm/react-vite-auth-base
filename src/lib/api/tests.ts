import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createAPIClient } from "./client";
import { DEFAULT_ERROR_MESSAGE, EMPTY_RESPONSE_MESSAGE } from "./constants";
import { APIError } from "./error";

function createJSONResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

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

		expect(options.signal).toBe(controller.signal);
	});

	test("throws APIError with backend error message and details", async () => {
		fetchMock.mockResolvedValueOnce(
			createJSONResponse(
				{
					error: "validation failed",
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
				message: "validation failed",
				details: {
					email: "invalid format",
				},
			}),
		);
	});

	test("falls back to default APIError message when backend error is missing", async () => {
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
				message: DEFAULT_ERROR_MESSAGE,
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
				message: DEFAULT_ERROR_MESSAGE,
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
});
