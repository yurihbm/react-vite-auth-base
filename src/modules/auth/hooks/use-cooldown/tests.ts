import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";

import { useCooldown } from ".";

describe("useCooldown", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("is idle until started", () => {
		const { result } = renderHook(() => useCooldown());

		expect(result.current.remaining).toBe(0);
	});

	test("counts down once per second after start", () => {
		const { result } = renderHook(() => useCooldown());

		act(() => result.current.start(3));
		expect(result.current.remaining).toBe(3);

		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(result.current.remaining).toBe(2);

		act(() => {
			vi.advanceTimersByTime(2000);
		});
		expect(result.current.remaining).toBe(0);
	});

	test("starts on a 429 error, using retryAfter when present", () => {
		const error = new APIError("rateLimit.exceeded", {
			status: 429,
			retryAfter: 7,
		});
		const { result } = renderHook(() => useCooldown(error));

		expect(result.current.remaining).toBe(7);
	});

	test("falls back to 60 seconds on a 429 without retryAfter", () => {
		const error = new APIError("auth.email.sendLimit", { status: 429 });
		const { result } = renderHook(() => useCooldown(error));

		expect(result.current.remaining).toBe(60);
	});

	test("ignores errors that are not rate limits", () => {
		const error = new APIError("auth.signup.invalidCode", { status: 401 });
		const { result } = renderHook(() => useCooldown(error));

		expect(result.current.remaining).toBe(0);
	});
});
