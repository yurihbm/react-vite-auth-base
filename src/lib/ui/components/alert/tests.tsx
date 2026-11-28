import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Alert } from ".";

describe("Alert", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<Alert type="info" title="Info" description="Description" />,
		);

		expect(container).toMatchSnapshot();
	});

	test("exposes an alert role", () => {
		const { getByRole } = render(<Alert title="Heads up" />);

		expect(getByRole("alert")).toBeTruthy();
	});

	test("renders a dismiss button when isDismissible is true", () => {
		const { getByRole } = render(<Alert title="Info" isDismissible />);

		expect(getByRole("button", { name: "Dismiss" })).toBeTruthy();
	});

	test("renders a dismiss button when onDismiss is provided", () => {
		const { getByRole } = render(<Alert title="Info" onDismiss={vi.fn()} />);

		expect(getByRole("button", { name: "Dismiss" })).toBeTruthy();
	});

	test("does not render a dismiss button by default", () => {
		const { queryByRole } = render(<Alert title="Info" />);

		expect(queryByRole("button", { name: "Dismiss" })).toBeNull();
	});

	test("calls onDismiss when the dismiss button is clicked", () => {
		const onDismiss = vi.fn();
		const { getByRole } = render(
			<Alert title="Info" isDismissible onDismiss={onDismiss} />,
		);

		fireEvent.click(getByRole("button", { name: "Dismiss" }));

		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	test("renders the title text", () => {
		const { getByText } = render(<Alert title="Update available" />);

		expect(getByText("Update available")).toBeTruthy();
	});

	test("renders the description text", () => {
		const { getByText } = render(
			<Alert description="Please review the changes" />,
		);

		expect(getByText("Please review the changes")).toBeTruthy();
	});

	test.each(["info", "success", "warning", "danger"] as const)(
		"renders the %s variant",
		(type) => {
			const { getByRole } = render(<Alert type={type} title="Alert" />);

			expect(getByRole("alert")).toBeTruthy();
		},
	);
});
