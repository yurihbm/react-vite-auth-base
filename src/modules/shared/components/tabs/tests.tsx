import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { Tabs } from ".";

const items = [
	{ value: "profile", label: "Profile", content: <div>Profile content</div> },
	{
		value: "security",
		label: "Security",
		content: <div>Security content</div>,
	},
	{
		value: "billing",
		label: "Billing",
		content: <div>Billing content</div>,
		disabled: true,
	},
];

describe("Tabs", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<Tabs items={items} defaultValue="profile" />);

		expect(container).toMatchSnapshot();
	});

	test("renders all tab buttons", () => {
		const { getAllByRole } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		const tabs = getAllByRole("tab");

		expect(tabs).toHaveLength(3);
		expect(tabs[0].textContent).toBe("Profile");
		expect(tabs[1].textContent).toBe("Security");
	});

	test("renders the panel for the default active tab", () => {
		const { getByRole } = render(<Tabs items={items} defaultValue="profile" />);

		expect(getByRole("tabpanel").textContent).toBe("Profile content");
	});

	test("switches panel on tab click", () => {
		const { getByRole, getByText } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		fireEvent.click(getByText("Security"));

		expect(getByRole("tabpanel").textContent).toBe("Security content");
	});

	test("active tab has aria-selected=true", () => {
		const { getAllByRole } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		const [profileTab, securityTab] = getAllByRole("tab");

		expect(profileTab.getAttribute("aria-selected")).toBe("true");
		expect(securityTab.getAttribute("aria-selected")).toBe("false");
	});

	test("tab is associated with its panel via aria-controls", () => {
		const { getAllByRole, getByRole } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		const activeTab = getAllByRole("tab")[0];
		const panel = getByRole("tabpanel");

		expect(activeTab.getAttribute("aria-controls")).toBe(
			panel.getAttribute("id"),
		);
	});

	test("panel is labelled by its tab via aria-labelledby", () => {
		const { getAllByRole, getByRole } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		const activeTab = getAllByRole("tab")[0];
		const panel = getByRole("tabpanel");

		expect(panel.getAttribute("aria-labelledby")).toBe(
			activeTab.getAttribute("id"),
		);
	});

	test("ArrowRight moves focus to the next tab", () => {
		const { getAllByRole } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		const [profileTab] = getAllByRole("tab");

		profileTab.focus();
		fireEvent.keyDown(profileTab, { key: "ArrowRight" });

		expect(document.activeElement?.textContent).toBe("Security");
	});

	test("ArrowLeft wraps to the last enabled tab, skipping disabled", () => {
		const { getAllByRole } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		const [profileTab] = getAllByRole("tab");

		profileTab.focus();
		fireEvent.keyDown(profileTab, { key: "ArrowLeft" });

		expect(document.activeElement?.textContent).toBe("Security");
	});

	test("Home moves focus to the first tab", () => {
		const { getAllByRole } = render(
			<Tabs items={items} defaultValue="security" />,
		);

		const tabs = getAllByRole("tab");

		tabs[1].focus();
		fireEvent.keyDown(tabs[1], { key: "Home" });

		expect(document.activeElement?.textContent).toBe("Profile");
	});

	test("End moves focus to the last enabled tab, skipping disabled", () => {
		const { getAllByRole } = render(
			<Tabs items={items} defaultValue="profile" />,
		);

		const [profileTab] = getAllByRole("tab");

		profileTab.focus();
		fireEvent.keyDown(profileTab, { key: "End" });

		expect(document.activeElement?.textContent).toBe("Security");
	});

	test("ArrowRight skips disabled tabs and wraps to first enabled", () => {
		const { getAllByRole } = render(
			<Tabs items={items} defaultValue="security" />,
		);

		const tabs = getAllByRole("tab");
		const securityTab = tabs[1];

		securityTab.focus();
		fireEvent.keyDown(securityTab, { key: "ArrowRight" });

		expect(document.activeElement?.textContent).toBe("Profile");
	});

	test("calls onChange when switching tabs in controlled mode", () => {
		const onChange = vi.fn();

		const { getByText } = render(
			<Tabs items={items} value="profile" onChange={onChange} />,
		);

		fireEvent.click(getByText("Security"));

		expect(onChange).toHaveBeenCalledWith("security");
	});

	test("disabled tab cannot be clicked", () => {
		const onChange = vi.fn();

		const { getByText } = render(
			<Tabs items={items} value="profile" onChange={onChange} />,
		);

		fireEvent.click(getByText("Billing"));

		expect(onChange).not.toHaveBeenCalled();
	});
});
