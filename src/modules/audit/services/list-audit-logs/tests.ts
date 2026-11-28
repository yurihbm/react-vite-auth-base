import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { listAuditLogsKey, useAuditLogsList } from ".";

const LOG = {
	uuid: "0196a0f0-0000-7000-8000-000000000001",
	actor_uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	ip_address: "127.0.0.1",
	user_agent: "vitest",
	action: "LOGIN",
	resource_type: "auth",
	resource_uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	request_uuid: "0196a0f0-0000-7000-8000-0000000000aa",
	status: "SUCCESS",
	created_at: "2026-02-01T10:00:00Z",
};

describe("useAuditLogsList", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("sends the filters as snake_case query params and omits empty ones", async () => {
		const fetchMock = mockFetch({
			"GET /audit-logs": jsonResponse({
				data: [LOG],
				message: "ok",
				meta: { total: 1 },
			}),
		});

		const { result } = renderHook(
			() =>
				useAuditLogsList({
					action: "LOGIN",
					resourceType: "auth",
					status: "SUCCESS",
					actorUuid: LOG.actor_uuid,
					startDate: "2026-02-01T00:00:00Z",
					endDate: "2026-03-01T00:00:00Z",
				}),
			{ wrapper: createQueryClientWrapper() },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		const [call] = fetchMock.callsTo("GET /audit-logs");
		const params = call.url.searchParams;
		expect(params.get("action")).toBe("LOGIN");
		expect(params.get("resource_type")).toBe("auth");
		expect(params.get("status")).toBe("SUCCESS");
		expect(params.get("actor_uuid")).toBe(LOG.actor_uuid);
		expect(params.get("start_date")).toBe("2026-02-01T00:00:00Z");
		expect(params.get("end_date")).toBe("2026-03-01T00:00:00Z");
		expect(params.has("cursor")).toBe(false);
	});

	test("maps logs and follows the cursor", async () => {
		const fetchMock = mockFetch({
			"GET /audit-logs": [
				jsonResponse({
					data: [LOG],
					message: "ok",
					meta: { total: 2, next_cursor: "abc" },
				}),
				jsonResponse({ data: [LOG], message: "ok", meta: { total: 2 } }),
			],
		});

		const { result } = renderHook(() => useAuditLogsList({}), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => expect(result.current.hasNextPage).toBe(true));
		expect(result.current.data?.pages[0].logs[0]).toMatchObject({
			uuid: LOG.uuid,
			actorUuid: LOG.actor_uuid,
			resourceType: "auth",
		});
		expect(result.current.data?.pages[0].total).toBe(2);

		await act(async () => {
			await result.current.fetchNextPage();
		});
		await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

		expect(
			fetchMock.callsTo("GET /audit-logs")[1].url.searchParams.get("cursor"),
		).toBe("abc");
		expect(result.current.hasNextPage).toBe(false);
		expect(listAuditLogsKey).toBe("audit/list");
	});

	test("accepts logs without actor", async () => {
		const { actor_uuid: _actor, ...system } = LOG;
		mockFetch({
			"GET /audit-logs": jsonResponse({ data: [system], message: "ok" }),
		});

		const { result } = renderHook(() => useAuditLogsList({}), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.pages[0].logs[0].actorUuid).toBeUndefined();
	});

	test("keeps the previous results while new filters load", async () => {
		mockFetch({
			"GET /audit-logs": (request) =>
				request.url.searchParams.get("action") === "LOGOUT"
					? new Promise<Response>(() => {})
					: jsonResponse({ data: [LOG], message: "ok", meta: { total: 1 } }),
		});

		const { result, rerender } = renderHook(
			({ action }: { action?: string }) => useAuditLogsList({ action }),
			{ wrapper: createQueryClientWrapper(), initialProps: {} },
		);
		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		rerender({ action: "LOGOUT" });

		await waitFor(() => expect(result.current.isFetching).toBe(true));
		expect(result.current.isPlaceholderData).toBe(true);
		expect(result.current.data?.pages[0].logs).toHaveLength(1);
	});
});
