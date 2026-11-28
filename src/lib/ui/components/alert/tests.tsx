import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Alert } from ".";

describe("Alert", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(
			<Alert color="info" title="Info" description="Description" />,
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
		(color) => {
			const { getByRole } = render(<Alert color={color} title="Alert" />);

			expect(getByRole("alert")).toBeTruthy();
		},
	);

	test("applies the color variant", () => {
		const { getByRole } = render(<Alert color="success" title="Saved" />);

		expect(getByRole("alert").className).toContain("bg-success-subtle");
	});

	test("still accepts the deprecated type prop", () => {
		const { getByRole } = render(<Alert type="danger" title="Failed" />);

		expect(getByRole("alert").className).toContain("bg-danger-subtle");
	});

	test("prefers color over the deprecated type prop", () => {
		const { getByRole } = render(
			<Alert color="warning" type="danger" title="Careful" />,
		);

		const alert = getByRole("alert");

		expect(alert.className).toContain("bg-warning-subtle");
		expect(alert.className).not.toContain("bg-danger-subtle");
	});
});
