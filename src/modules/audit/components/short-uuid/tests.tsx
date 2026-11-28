import type { ReactNode } from "react";

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ShortUuid } from ".";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		to,
		params,
		children,
		title,
	}: {
		to: string;
		params: { uuid: string };
		children: ReactNode;
		title?: string;
	}) => (
		<a href={to.replace("$uuid", params.uuid)} title={title}>
			{children}
		</a>
	),
}));

const UUID = "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11";

describe("ShortUuid", () => {
	const writeText = vi.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		vi.stubGlobal("navigator", { clipboard: { writeText } });
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});

	test("shows the start of the UUID and the full value on hover", () => {
		render(<ShortUuid uuid={UUID} />);

		const text = screen.getByText("6f1f7c52…");

		expect(text.getAttribute("title")).toBe(UUID);
		expect(screen.queryByRole("link")).toBeNull();
	});

	test("links to the user when asked", () => {
		render(<ShortUuid linkToUser uuid={UUID} />);

		const link = screen.getByRole("link", { name: "6f1f7c52…" });

		expect(link.getAttribute("href")).toBe(`/admin/users/${UUID}`);
		expect(link.getAttribute("title")).toBe(UUID);
	});

	test("copies the full UUID and confirms it", async () => {
		render(<ShortUuid uuid={UUID} />);

		await act(async () => {
			fireEvent.click(
				screen.getByRole("button", { name: "auditLogsList.copyId" }),
			);
		});

		expect(writeText).toHaveBeenCalledWith(UUID);
		expect(
			screen.getByRole("button", { name: "auditLogsList.copiedId" }),
		).toBeTruthy();
	});
});
