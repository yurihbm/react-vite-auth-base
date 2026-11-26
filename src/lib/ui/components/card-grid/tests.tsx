import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { Card } from "@lib/ui/components/card";

import { CardGrid } from ".";

const children = (
	<>
		{Array.from({ length: 6 }, (_, i) => i + 1).map((key) => (
			<Card data-testid="card" key={key}>
				CardGrid - Card {key}
			</Card>
		))}
	</>
);

describe("CardGrid", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		const { container } = render(<CardGrid>{children}</CardGrid>);

		expect(container).toMatchSnapshot();
	});

	test("renders children", () => {
		render(<CardGrid>{children}</CardGrid>);

		const cards = screen.getAllByTestId("card");

		expect(cards.length).toBe(6);
	});
});
