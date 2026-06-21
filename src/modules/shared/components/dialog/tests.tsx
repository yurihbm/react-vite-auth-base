import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Dialog } from ".";

describe("Dialog", () => {
	afterEach(() => {
		cleanup();
	});

	test("does not render anything when closed", () => {
		render(
			<Dialog open={false} onClose={() => {}} title="Hidden">
				Body
			</Dialog>,
		);

		expect(document.querySelector('[role="dialog"]')).toBeNull();
	});

	test("renders title, description, and body with aria wiring when open", () => {
		const { getByRole, getByText } = render(
			<Dialog
				open
				onClose={() => {}}
				title="Confirm"
				description="Please confirm"
			>
				Dialog body
			</Dialog>,
		);

		const dialog = getByRole("dialog");

		expect(dialog.getAttribute("aria-modal")).toBe("true");
		expect(dialog.getAttribute("aria-labelledby")).not.toBeNull();
		expect(dialog.getAttribute("aria-describedby")).not.toBeNull();
		expect(getByText("Confirm")).not.toBeNull();
		expect(getByText("Dialog body")).not.toBeNull();
	});

	test("calls onClose when Escape is pressed", () => {
		const onClose = vi.fn();

		const { getByRole } = render(
			<Dialog open onClose={onClose} title="Esc">
				Body
			</Dialog>,
		);

		fireEvent.keyDown(getByRole("dialog"), { key: "Escape" });

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test("calls onClose when the backdrop is clicked", () => {
		const onClose = vi.fn();

		const { getByRole } = render(
			<Dialog open onClose={onClose} title="Backdrop">
				Body
			</Dialog>,
		);

		const overlay = getByRole("dialog").parentElement as HTMLElement;
		fireEvent.click(overlay);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test("does not close on backdrop click when closeOnBackdrop is false", () => {
		const onClose = vi.fn();

		const { getByRole } = render(
			<Dialog closeOnBackdrop={false} open onClose={onClose} title="Locked">
				Body
			</Dialog>,
		);

		fireEvent.click(getByRole("dialog").parentElement as HTMLElement);

		expect(onClose).not.toHaveBeenCalled();
	});

	test("calls onClose when the close button is clicked", () => {
		const onClose = vi.fn();

		const { getByLabelText } = render(
			<Dialog open onClose={onClose} title="Closable">
				Body
			</Dialog>,
		);

		fireEvent.click(getByLabelText("Close"));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	test("stacks a later-opened dialog above an earlier one", () => {
		render(
			<Dialog open onClose={() => {}} title="First">
				Body
			</Dialog>,
		);
		render(
			<Dialog open onClose={() => {}} title="Second">
				Body
			</Dialog>,
		);

		const overlays = document.querySelectorAll<HTMLElement>('[role="dialog"]');
		const firstOverlay = overlays[0].parentElement as HTMLElement;
		const secondOverlay = overlays[1].parentElement as HTMLElement;

		const firstZIndex = Number(firstOverlay.style.zIndex);
		const secondZIndex = Number(secondOverlay.style.zIndex);

		expect(secondZIndex).toBeGreaterThan(firstZIndex);
	});

	test("only the topmost dialog renders an interactive backdrop", () => {
		render(
			<Dialog open onClose={() => {}} title="First">
				Body
			</Dialog>,
		);
		render(
			<Dialog open onClose={() => {}} title="Second">
				Body
			</Dialog>,
		);

		const overlays = document.querySelectorAll<HTMLElement>('[role="dialog"]');
		const firstOverlay = overlays[0].parentElement as HTMLElement;
		const secondOverlay = overlays[1].parentElement as HTMLElement;

		expect(firstOverlay.className).not.toContain("bg-background-inverse/40");
		expect(secondOverlay.className).toContain("bg-background-inverse/40");
	});

	test("non-top dialogs are inert and excluded from interaction", () => {
		render(
			<Dialog open onClose={() => {}} title="First">
				Body
			</Dialog>,
		);
		render(
			<Dialog open onClose={() => {}} title="Second">
				Body
			</Dialog>,
		);

		const overlays = document.querySelectorAll<HTMLElement>('[role="dialog"]');
		const firstOverlay = overlays[0].parentElement as HTMLElement;
		const secondOverlay = overlays[1].parentElement as HTMLElement;

		expect(firstOverlay.inert).toBe(true);
		expect(secondOverlay.inert).toBe(false);
	});
});
