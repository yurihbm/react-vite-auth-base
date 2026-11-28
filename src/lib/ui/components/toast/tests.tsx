import type { ReactNode } from "react";

import {
	act,
	cleanup,
	fireEvent,
	render,
	renderHook,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ToastProvider } from ".";
import { useToast } from "./use-toast";

function wrapper({ children }: { children: ReactNode }) {
	return <ToastProvider defaultDuration={0}>{children}</ToastProvider>;
}

describe("Toast", () => {
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	test("useToast throws outside of a provider", () => {
		expect(() => renderHook(() => useToast())).toThrow(
			/within a ToastProvider/,
		);
	});

	test("adds and dismisses toasts via the hook", () => {
		const { result } = renderHook(() => useToast(), { wrapper });

		let id = "";
		act(() => {
			id = result.current.toast({ title: "Hello" });
		});

		expect(result.current.toasts).toHaveLength(1);
		expect(result.current.toasts[0].title).toBe("Hello");

		act(() => {
			result.current.dismiss(id);
		});

		expect(result.current.toasts).toHaveLength(0);
	});

	test("renders a toast in the viewport with its color and role", () => {
		function Trigger() {
			const { toast } = useToast();
			return (
				<button onClick={() => toast({ title: "Saved", color: "success" })}>
					show
				</button>
			);
		}

		const { getByText, getByRole } = render(
			<ToastProvider defaultDuration={0}>
				<Trigger />
			</ToastProvider>,
		);

		fireEvent.click(getByText("show"));

		const toastEl = getByRole("status");

		expect(getByText("Saved")).not.toBeNull();
		expect(toastEl.getAttribute("aria-live")).toBe("polite");
		expect(toastEl.className).toContain("bg-success-subtle");
	});

	test("auto-dismisses after the given duration", () => {
		vi.useFakeTimers();

		const { result } = renderHook(() => useToast(), { wrapper });

		act(() => {
			result.current.toast({ title: "Temporary", duration: 1000 });
		});

		expect(result.current.toasts).toHaveLength(1);

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(result.current.toasts).toHaveLength(0);
	});

	test("uses the provider duration when toast duration is undefined", () => {
		vi.useFakeTimers();
		const durationWrapper = ({ children }: { children: ReactNode }) => (
			<ToastProvider defaultDuration={100}>{children}</ToastProvider>
		);
		const { result } = renderHook(() => useToast(), {
			wrapper: durationWrapper,
		});

		act(() => {
			result.current.toast({ title: "Temporary", duration: undefined });
		});
		act(() => {
			vi.advanceTimersByTime(100);
		});

		expect(result.current.toasts).toHaveLength(0);
	});

	test("dismisses when the close button is clicked", () => {
		function Trigger() {
			const { toast } = useToast();
			return <button onClick={() => toast({ title: "Closable" })}>show</button>;
		}

		const { getByText, getByLabelText, queryByText } = render(
			<ToastProvider defaultDuration={0}>
				<Trigger />
			</ToastProvider>,
		);

		fireEvent.click(getByText("show"));
		expect(getByText("Closable")).not.toBeNull();

		fireEvent.click(getByLabelText("Dismiss"));
		expect(queryByText("Closable")).toBeNull();
	});
});
