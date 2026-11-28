import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { DescriptionList } from ".";

const ITEMS = [
	{ label: "Email", value: "test@mail.com" },
	{ label: "Role", value: "user" },
];

describe("DescriptionList", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<DescriptionList items={ITEMS} />);

		expect(container).toMatchSnapshot();
	});

	test("renders each item as a term and its definition", () => {
		const { getAllByRole } = render(<DescriptionList items={ITEMS} />);

		const terms = getAllByRole("term");
		const definitions = getAllByRole("definition");

		expect(terms.map((term) => term.textContent)).toEqual(["Email", "Role"]);
		expect(definitions.map((definition) => definition.textContent)).toEqual([
			"test@mail.com",
			"user",
		]);
		expect(terms[0].tagName).toBe("DT");
		expect(definitions[0].tagName).toBe("DD");
	});

	test("lays out label and value in two columns from the sm breakpoint", () => {
		const { getAllByRole } = render(<DescriptionList items={ITEMS} />);

		const row = getAllByRole("term")[0].parentElement;

		expect(row?.className).toContain("sm:grid-cols-3");
		expect(getAllByRole("definition")[0].className).toContain("sm:col-span-2");
	});

	test("merges custom className on the list", () => {
		const { container } = render(
			<DescriptionList className="custom" items={ITEMS} />,
		);

		const list = container.querySelector("dl");

		expect(list?.className).toContain("custom");
	});
});
