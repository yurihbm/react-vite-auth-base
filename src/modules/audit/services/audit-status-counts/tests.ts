import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createQueryClientWrapper, jsonResponse, mockFetch } from "@lib/tests";

import { useAuditStatusCounts } from ".";

function totalFor(status: string | null) {
	return status === "FAILURE" ? 3 : 40;
}

describe("useAuditStatusCounts", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("counts successes and failures from the totals of two one-row pages", async () => {
		const fetchMock = mockFetch({
			"GET /audit-logs": ({ url }) =>
				jsonResponse({
					data: [],
					message: "ok",
					meta: { total: totalFor(url.searchParams.get("status")) },
				}),
		});

		const { result } = renderHook(
			() => useAuditStatusCounts({ action: "LOGIN" }),
			{ wrapper: createQueryClientWrapper() },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual({ success: 40, failure: 3 });

		const calls = fetchMock.callsTo("GET /audit-logs");
		expect(calls).toHaveLength(2);
		for (const call of calls) {
			expect(call.url.searchParams.get("limit")).toBe("1");
			expect(call.url.searchParams.get("action")).toBe("LOGIN");
		}
		expect(calls.map((call) => call.url.searchParams.get("status"))).toEqual([
			"SUCCESS",
			"FAILURE",
		]);
	});

	test("only asks for the filtered status", async () => {
		const fetchMock = mockFetch({
			"GET /audit-logs": jsonResponse({
				data: [],
				message: "ok",
				meta: { total: 3 },
			}),
		});

		const { result } = renderHook(
			() => useAuditStatusCounts({ status: "FAILURE" }),
			{ wrapper: createQueryClientWrapper() },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual({ success: 0, failure: 3 });
		expect(fetchMock.callsTo("GET /audit-logs")).toHaveLength(1);
	});

	test("rejects with the API error key", async () => {
		mockFetch({
			"GET /audit-logs": jsonResponse(
				{ error: "audit.list.badRequest", message: "x" },
				400,
			),
		});

		const { result } = renderHook(() => useAuditStatusCounts({}), {
			wrapper: createQueryClientWrapper(),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(result.current.error).toMatchObject({
			key: "audit.list.badRequest",
		});
	});
});
