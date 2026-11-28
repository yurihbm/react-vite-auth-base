import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { APIError } from "@lib/api";

import { RevertConfirm } from ".";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

const baseProps = {
	description: "This will undo the change.",
	confirmLabel: "Undo it",
	successMessage: "Done.",
	onConfirm: vi.fn(),
};

describe("RevertConfirm", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	test("renders correctly", () => {
		const { container } = render(<RevertConfirm {...baseProps} />);

		expect(container).toMatchSnapshot();
	});

	test("does not act until the confirm button is clicked", () => {
		const { getByRole } = render(<RevertConfirm {...baseProps} />);

		expect(baseProps.onConfirm).not.toHaveBeenCalled();

		fireEvent.click(getByRole("button", { name: "Undo it" }));

		expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
	});

	test("shows the result and hides the button on success", () => {
		const { getByText, queryByRole } = render(
			<RevertConfirm {...baseProps} isSuccess />,
		);

		expect(getByText("Done.")).toBeDefined();
		expect(queryByRole("button", { name: "Undo it" })).toBeNull();
	});

	test("shows the translated API error", () => {
		const { getByText } = render(
			<RevertConfirm
				{...baseProps}
				error={new APIError("auth.oauthLink.staleToken", { status: 401 })}
			/>,
		);

		expect(getByText("translated:auth.oauthLink.staleToken")).toBeDefined();
	});

	test("disables the button while pending", () => {
		const { getByRole } = render(<RevertConfirm {...baseProps} isPending />);

		expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
	});

	test("disables the button after a rate limit error", () => {
		const { getByRole } = render(
			<RevertConfirm
				{...baseProps}
				error={new APIError("rateLimit.exceeded", { status: 429 })}
			/>,
		);

		expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
	});

	test("leaves the page heading to the layout", () => {
		const { queryByRole } = render(<RevertConfirm {...baseProps} />);

		expect(queryByRole("heading")).toBeNull();
	});

	test("explains an incomplete link instead of offering a dead button", () => {
		const { getByRole, queryByRole } = render(
			<RevertConfirm {...baseProps} isLinkInvalid />,
		);

		expect(getByRole("alert").textContent).toContain(
			"revertLink.invalid.description",
		);
		expect(
			getByRole("link", { name: "revertLink.invalid.action" }).getAttribute(
				"href",
			),
		).toBe("/");
		expect(queryByRole("button", { name: "Undo it" })).toBeNull();
	});
});
