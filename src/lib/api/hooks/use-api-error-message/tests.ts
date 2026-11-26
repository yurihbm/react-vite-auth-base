import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { useApiErrorMessage } from ".";
import { APIError } from "../../error";

const MESSAGES: Record<string, string> = {
	"auth.unauthorized": "Sign in first.",
	"http.404": "Not found.",
	"client.unknown": "Unexpected.",
};

vi.mock("@lib/i18n", () => ({
	useTranslate: () => (key: string, options?: { defaultValue?: string }) =>
		MESSAGES[key] ?? options?.defaultValue ?? key,
}));

describe("useApiErrorMessage", () => {
	test("translates the error key", () => {
		const error = new APIError("auth.unauthorized", { status: 401 });

		const { result } = renderHook(() => useApiErrorMessage(error));

		expect(result.current).toBe("Sign in first.");
	});

	test("falls back to the http status message for untranslated keys", () => {
		const error = new APIError("x.y", { status: 404, key: "x.y" });

		const { result } = renderHook(() => useApiErrorMessage(error));

		expect(result.current).toBe("Not found.");
	});

	test("falls back to client.unknown for unknown statuses", () => {
		const error = new APIError("x.y", { status: 418, key: "x.y" });

		const { result } = renderHook(() => useApiErrorMessage(error));

		expect(result.current).toBe("Unexpected.");
	});

	test("uses client.unknown for non-API errors", () => {
		const { result } = renderHook(() => useApiErrorMessage(new Error("x")));

		expect(result.current).toBe("Unexpected.");
	});
});
