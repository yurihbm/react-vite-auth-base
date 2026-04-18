import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { useTranslateKeyState } from ".";

describe("useTranslateKeyState", () => {
	test("initializes with null key", () => {
		const { result } = renderHook(() => useTranslateKeyState());

		expect(result.current.key).toBeNull();
	});

	test("sets a translation key when setKey is called", () => {
		const { result } = renderHook(() => useTranslateKeyState("shared"));

		act(() => {
			result.current.setKey("en");
		});

		expect(result.current.key).toBe("en");
	});

	test("clears the key when setKey is called with null", () => {
		const { result } = renderHook(() => useTranslateKeyState("shared"));

		act(() => {
			result.current.setKey("en");
		});

		expect(result.current.key).toBe("en");

		act(() => {
			result.current.setKey(null);
		});

		expect(result.current.key).toBeNull();
	});

	test("updates the key when setKey is called with a different key", () => {
		const { result } = renderHook(() => useTranslateKeyState("shared"));

		act(() => {
			result.current.setKey("en");
		});

		expect(result.current.key).toBe("en");

		act(() => {
			result.current.setKey("pt");
		});

		expect(result.current.key).toBe("pt");
	});

	test("uses default namespace when not provided", () => {
		const { result } = renderHook(() => useTranslateKeyState());

		act(() => {
			result.current.setKey("en");
		});

		expect(result.current.key).toBe("en");
	});

	test("maintains separate state for different namespace instances", () => {
		const { result: result1 } = renderHook(() =>
			useTranslateKeyState("shared"),
		);
		const { result: result2 } = renderHook(() => useTranslateKeyState("auth"));

		act(() => {
			result1.current.setKey("en");
		});

		act(() => {
			result2.current.setKey("loginForm.unexpectedError");
		});

		expect(result1.current.key).toBe("en");
		expect(result2.current.key).toBe("loginForm.unexpectedError");
	});
});
